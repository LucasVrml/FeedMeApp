"use server";

import { Category, FormattedRecipe, IngredientDetail } from "@/database.types";
import { revalidatePath } from "next/cache";
import { getSupabase } from "../utils/getSupabaseInstance";
import { formatIngredients } from "../utils/formaIngredients";
import OpenAI from "openai";
import axios from "axios";
import cheerio from "cheerio";
import { z } from "zod";
import { decodeUnicode } from "../utils/decodeUnicode";
import { decode } from "base64-arraybuffer";
import { findMostSimilarString } from "../utils/similarString";
import { findBestMatch } from "string-similarity";
import { getUserInfos } from "../auth/serverFunctions";
import { error } from "console";

const unitList = [
  "/",
  "g",
  "kg",
  "ml",
  "cl",
  "L",
  "c.c",
  "c.s",
  "pincée(s)",
  "gousse(s)",
  "branche(s)",
  "goutte(s)",
  "tasse(s)",
  "tranche(s)",
  "morceaux",
  "feuille(s)",
  "tige(s)",
  "bouquet(s)",
  "sachet(s)",
  "paquet(s)",
  "tablette(s)",
  "verre(s)",
  "zeste(s)",
  "bâton(s)",
  "tête(s)",
  "filet(s)",
  "cube(s)",
];

export async function fetchRecipes(limit?: number) {
  const schema = z.object({
    limit: z.number().optional(),
  });
  const res = schema.safeParse({ limit });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase
    .from("recipe")
    .select(
      "id, name, counter, steps, image_url, image_path, category(id, name), recipe_ingredient (quantity, unit, ingredient (id, name))"
    )
    .eq("user_id", user.id)
    .limit(res.data.limit || 1000);
  if (error) {
    return {
      error,
    };
  }
  // @ts-ignore
  const formattedData = formatIngredients(data);
  return {
    error: null,
    data: formattedData as FormattedRecipe[],
  };
}

export async function fetchRecipe(id: number) {
  const schema = z.object({
    id: z.number(),
  });
  const res = schema.safeParse({ id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase
    .from("recipe")
    .select(
      "id, name, counter, steps, image_url, image_path, category(id, name), recipe_ingredient (quantity, unit, ingredient (id, name))"
    )
    .eq("user_id", user.id)
    .eq("id", res.data.id);
  if (error) {
    return {
      error,
    };
  }
  // @ts-ignore
  const formattedData = formatIngredients(data);
  return {
    error: null,
    data: formattedData[0] as FormattedRecipe,
  };
}

export async function addRecipeImage(
  file_path: string,
  file: string,
  recipe_id: number,
  former_image_path?: string
) {
  const schema = z.object({
    file_path: z.string(),
    file: z.string(),
    recipe_id: z.number(),
    former_image_path: z.string().optional().nullable(),
  });
  const res = schema.safeParse({
    file_path,
    file,
    recipe_id,
    former_image_path,
  });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error: errorDelete } = await deleteImageFromBucket(
    res.data.former_image_path
  );
  if (errorDelete) {
    return {
      error: errorDelete,
    };
  }
  const { data, error } = await supabase.storage
    .from("recipes_images")
    .upload(res.data.file_path, decode(res.data.file), {
      contentType: "image/png",
    });

  if (error) {
    return {
      error,
    };
  }

  const { data: publicURL } = supabase.storage
    .from("recipes_images")
    .getPublicUrl(res.data.file_path);
  const { data: recipeData, error: recipeError } = await supabase
    .from("recipe")
    .update({
      image_url: publicURL.publicUrl,
      image_path: res.data.file_path,
    })
    .eq("id", res.data.recipe_id);

  if (recipeError) {
    return {
      error: recipeError,
    };
  }
  revalidatePath("/protected/recipes");
  return {
    error: null,
    data: publicURL.publicUrl,
  };
}

export async function fetchCategories() {
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase
    .from("category")
    .select("id, name, user_id")
    .or(`user_id.eq.${user.id},user_id.is.null`);
  return {
    error,
    data: data as Category[],
  };
}

export async function deleteCategory(category_id: number) {
  const schema = z.object({
    category_id: z.number(),
  });
  const res = schema.safeParse({ category_id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase
    .from("category")
    .delete()
    .eq("id", res.data.category_id)
    .eq("user_id", user.id)
    .select();
  if (error) {
    return {
      error,
    };
  }
  revalidatePath("/protected/recipes");
  return {
    error: null,
    data,
  };
}

export async function addRecipeCategory(
  recipe_id: number,
  category_id: number
) {
  const schema = z.object({
    category_id: z.number(),
    recipe_id: z.number(),
  });
  const res = schema.safeParse({ category_id, recipe_id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error } = await supabase.from("recipe_category").insert({
    recipe_id: res.data.recipe_id,
    category_id: res.data.category_id,
  });
  if (error) {
    return {
      error,
    };
  }
  revalidatePath("/protected/recipes");
  return {
    error: null,
  };
}

export async function removeRecipeCategory(
  recipe_id: number,
  category_id: number
) {
  const schema = z.object({
    category_id: z.number(),
    recipe_id: z.number(),
  });
  const res = schema.safeParse({ category_id, recipe_id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error } = await supabase
    .from("recipe_category")
    .delete()
    .eq("recipe_id", res.data.recipe_id)
    .eq("category_id", res.data.category_id);
  if (error) {
    return {
      error,
    };
  }
  revalidatePath("/protected/recipes");
  return {
    error: null,
  };
}

export async function fetchIngredientsSearch(search: string) {
  const schema = z.object({
    search: z.string(),
  });
  const res = schema.safeParse({ search });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase } = await getSupabase();
  const { error, data } = await supabase
    .from("ingredient")
    .select("id, name")
    .ilike("name", `%${res.data.search}%`)
    .limit(30);
  return {
    error,
    data,
  };
}

export async function deleteRecipe(id: number, image_path?: string) {
  const schema = z.object({
    id: z.number(),
    image_path: z.string().optional().nullable(),
  });
  const res = schema.safeParse({ id, image_path });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error: errorDelete } = await deleteImageFromBucket(image_path);
  if (errorDelete) {
    return {
      error: errorDelete,
    };
  }
  const { error } = await supabase
    .from("recipe")
    .delete()
    .eq("id", res.data.id)
    .eq("user_id", user.id);
  if (error) {
    return {
      error,
    };
  }
  revalidatePath("/protected/recipes");
  return {
    error: null,
  };
}

export async function createRecipe(
  name: string,
  count: number,
  ingredients: IngredientDetail[],
  steps: string[],
  categories: Category[],
  newImage?: string | null,
  newImagePath?: string | null,
  newImageUrl?: string | null,
  notCreateImage?: boolean
) {
  const schema = z.object({
    name: z.string(),
    newImage: z.string().optional().nullable(),
    newImagePath: z.string().optional().nullable(),
    newImageUrl: z.string().optional().nullable(),
    count: z.number(),
    ingredients: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        quantity: z.number().optional().nullable(),
        unit: z.string().optional(),
      })
    ),
    steps: z.string().array(),
    categories: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        active: z.boolean().optional(),
        user_id: z.string().optional().nullable(),
      })
    ),
    notCreateImage: z.boolean().optional(),
  });
  const res = schema.safeParse({
    name,
    newImage,
    newImagePath,
    newImageUrl,
    count,
    ingredients,
    steps,
    categories,
    notCreateImage,
  });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  let publicUrlData = null;
  if (!res.data.notCreateImage) {
    if (res.data.newImage && res.data.newImagePath) {
      const { error: errorUpload } = await supabase.storage
        .from("recipes_images")
        .upload(res.data.newImagePath, decode(res.data.newImage), {
          contentType: "image/png",
        });
      if (errorUpload) {
        return {
          error: errorUpload,
        };
      }
      const { data: publicURL } = supabase.storage
        .from("recipes_images")
        .getPublicUrl(res.data.newImagePath);
      publicUrlData = publicURL.publicUrl;
    }
  } else {
    if (res.data.newImageUrl) {
      publicUrlData = res.data.newImageUrl;
    }
  }
  const { error, data } = await supabase
    .from("recipe")
    .insert({
      name: res.data.name,
      counter: res.data.count,
      image_url: publicUrlData,
      image_path: res.data.newImagePath,
      steps: res.data.steps,
      user_id: user.id,
    })
    .select("id");
  if (error) {
    return {
      error,
    };
  }
  const formattedIngredients = res.data.ingredients.map(
    ({ id, quantity, unit }) => {
      return {
        recipe_id: data[0].id,
        ingredient_id: id,
        quantity,
        unit,
      };
    }
  );
  const formattedCategories = res.data.categories
    ?.filter((el) => el.active)
    .map(({ id }) => {
      return {
        recipe_id: data[0].id,
        category_id: id,
      };
    });
  const { error: recipeError } = await supabase
    .from("recipe_ingredient")
    .insert(formattedIngredients);
  if (recipeError) {
    return {
      error: recipeError,
    };
  }
  const { error: categoryError } = await supabase
    .from("recipe_category")
    .insert(formattedCategories);
  if (categoryError) {
    return {
      error: categoryError,
    };
  }
  revalidatePath("/protected/recipes");
  return {
    error: null,
  };
}

export async function updateRecipe(
  recipeId: number,
  name: string,
  count: number,
  ingredients: IngredientDetail[],
  steps: string[],
  categories: Category[]
) {
  const schema = z.object({
    recipeId: z.number(),
    name: z.string(),
    count: z.number(),
    ingredients: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        quantity: z.number().optional().nullable(),
        unit: z.string().optional(),
      })
    ),
    steps: z.string().array(),
    categories: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        active: z.boolean().optional(),
        user_id: z.string().optional(),
      })
    ),
  });
  const res = schema.safeParse({
    recipeId,
    name,
    count,
    ingredients,
    steps,
    categories,
  });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error } = await supabase
    .from("recipe")
    .update({
      name: res.data.name,
      counter: res.data.count,
      steps: res.data.steps,
      user_id: user.id,
    })
    .eq("id", res.data.recipeId);
  if (error) {
    return {
      error,
    };
  }
  const { error: ingredientError } = await supabase
    .from("recipe_ingredient")
    .delete()
    .eq("recipe_id", res.data.recipeId);
  if (ingredientError) {
    return {
      error: ingredientError,
    };
  }
  const { error: categoryError } = await supabase
    .from("recipe_category")
    .delete()
    .eq("recipe_id", res.data.recipeId);
  if (categoryError) {
    return {
      error: categoryError,
    };
  }
  const formattedIngredients = res.data.ingredients.map(
    ({ id, quantity, unit }) => {
      return {
        recipe_id: res.data.recipeId,
        ingredient_id: id,
        quantity,
        unit,
      };
    }
  );
  const formattedCategories = res.data.categories
    ?.filter((el) => el.active)
    .map(({ id }) => {
      return {
        recipe_id: res.data.recipeId,
        category_id: id,
      };
    });
  const { error: insertIngredientError } = await supabase
    .from("recipe_ingredient")
    .insert(formattedIngredients);
  if (insertIngredientError) {
    return {
      error: insertIngredientError,
    };
  }
  const { error: insertCategoryError } = await supabase
    .from("recipe_category")
    .insert(formattedCategories);
  if (insertCategoryError) {
    return {
      error: insertCategoryError,
    };
  }
  revalidatePath("/protected/recipes");
  return {
    error: null,
  };
}

export async function updateRecipeWithImage(
  recipeId: number,
  name: string,
  newImage: string,
  newImagePath: string,
  count: number,
  ingredients: IngredientDetail[],
  steps: string[],
  categories: Category[],
  defaultImagePath?: string
) {
  const schema = z.object({
    recipeId: z.number(),
    name: z.string(),
    newImage: z.string(),
    newImagePath: z.string(),
    count: z.number(),
    defaultImagePath: z.string().optional().nullable(),
    ingredients: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        quantity: z.number().optional().nullable(),
        unit: z.string().optional(),
      })
    ),
    steps: z.string().array(),
    categories: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        active: z.boolean().optional(),
        user_id: z.string().optional(),
      })
    ),
  });
  const res = schema.safeParse({
    recipeId,
    name,
    newImage,
    newImagePath,
    count,
    defaultImagePath,
    ingredients,
    steps,
    categories,
  });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error: errorDelete } = await deleteImageFromBucket(
    res.data.defaultImagePath
  );
  if (errorDelete) {
    return {
      errorDelete,
    };
  }
  const { error: errorUpload } = await supabase.storage
    .from("recipes_images")
    .upload(res.data.newImagePath, decode(res.data.newImage), {
      contentType: "image/png",
    });
  if (errorUpload) {
    return {
      errorUpload,
    };
  }
  const { data: publicURL } = supabase.storage
    .from("recipes_images")
    .getPublicUrl(res.data.newImagePath);

  const { error } = await supabase
    .from("recipe")
    .update({
      name: res.data.name,
      image_url: publicURL.publicUrl,
      image_path: res.data.newImagePath,
      counter: res.data.count,
      steps: res.data.steps,
      user_id: user.id,
    })
    .eq("id", res.data.recipeId);
  if (error) {
    return {
      error,
    };
  }
  const { error: ingredientError } = await supabase
    .from("recipe_ingredient")
    .delete()
    .eq("recipe_id", res.data.recipeId);
  if (ingredientError) {
    return {
      error: ingredientError,
    };
  }
  const { error: categoryError } = await supabase
    .from("recipe_category")
    .delete()
    .eq("recipe_id", res.data.recipeId);
  if (categoryError) {
    return {
      error: categoryError,
    };
  }
  const formattedIngredients = res.data.ingredients.map(
    ({ id, quantity, unit }) => {
      return {
        recipe_id: res.data.recipeId,
        ingredient_id: id,
        quantity,
        unit,
      };
    }
  );
  const formattedCategories = res.data.categories
    ?.filter((el) => el.active)
    .map(({ id }) => {
      return {
        recipe_id: res.data.recipeId,
        category_id: id,
      };
    });
  const { error: insertIngredientError } = await supabase
    .from("recipe_ingredient")
    .insert(formattedIngredients);
  if (insertIngredientError) {
    return {
      error: insertIngredientError,
    };
  }
  const { error: insertCategoryError } = await supabase
    .from("recipe_category")
    .insert(formattedCategories);
  if (insertCategoryError) {
    return {
      error: insertCategoryError,
    };
  }
  revalidatePath("/protected/recipes");
  return {
    error: null,
  };
}

export async function updateRecipeWithDeleteImage(
  recipeId: number,
  name: string,
  count: number,
  ingredients: IngredientDetail[],
  steps: string[],
  categories: Category[],
  defaultImagePath?: string
) {
  const schema = z.object({
    recipeId: z.number(),
    name: z.string(),
    count: z.number(),
    defaultImagePath: z.string().optional().nullable(),
    ingredients: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        quantity: z.number().optional().nullable(),
        unit: z.string().optional(),
      })
    ),
    steps: z.string().array(),
    categories: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        active: z.boolean().optional(),
        user_id: z.string().optional(),
      })
    ),
  });
  const res = schema.safeParse({
    recipeId,
    name,
    count,
    defaultImagePath,
    ingredients,
    steps,
    categories,
  });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error: errorDelete } = await deleteImageFromBucket(
    res.data.defaultImagePath
  );
  if (errorDelete) {
    return {
      errorDelete,
    };
  }

  const { error } = await supabase
    .from("recipe")
    .update({
      name: res.data.name,
      image_url: null,
      image_path: null,
      counter: res.data.count,
      steps: res.data.steps,
      user_id: user.id,
    })
    .eq("id", res.data.recipeId);
  if (error) {
    return {
      error,
    };
  }
  const { error: ingredientError } = await supabase
    .from("recipe_ingredient")
    .delete()
    .eq("recipe_id", res.data.recipeId);
  if (ingredientError) {
    return {
      error: ingredientError,
    };
  }
  const { error: categoryError } = await supabase
    .from("recipe_category")
    .delete()
    .eq("recipe_id", res.data.recipeId);
  if (categoryError) {
    return {
      error: categoryError,
    };
  }
  const formattedIngredients = res.data.ingredients.map(
    ({ id, quantity, unit }) => {
      return {
        recipe_id: res.data.recipeId,
        ingredient_id: id,
        quantity,
        unit,
      };
    }
  );
  const formattedCategories = res.data.categories
    ?.filter((el) => el.active)
    .map(({ id }) => {
      return {
        recipe_id: res.data.recipeId,
        category_id: id,
      };
    });
  const { error: insertIngredientError } = await supabase
    .from("recipe_ingredient")
    .insert(formattedIngredients);
  if (insertIngredientError) {
    return {
      error: insertIngredientError,
    };
  }
  const { error: insertCategoryError } = await supabase
    .from("recipe_category")
    .insert(formattedCategories);
  if (insertCategoryError) {
    return {
      error: insertCategoryError,
    };
  }
  revalidatePath("/protected/recipes");
  return {
    error: null,
  };
}

export async function deleteImageFromBucket(imagePath?: string | null) {
  const schema = z.object({
    imagePath: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
  });
  const res = schema.safeParse({
    imagePath,
  });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase
    .from("recipe")
    .select("id")
    .eq("image_path", res.data.imagePath);
  if (error) {
    return {
      error,
    };
  }
  if (res.data.imagePath && data.length === 1) {
    const { error: errorDelete, data: removedData } = await supabase.storage
      .from("recipes_images")
      .remove([`${res.data.imagePath}`]);
    if (errorDelete) {
      return {
        errorDelete,
      };
    }
  }
  return {
    error: null,
  };
}

export async function createCategory(name: string) {
  const schema = z.object({
    name: z.string(),
  });
  const res = schema.safeParse({ name });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase.from("category").insert({
    name: res.data.name,
    user_id: user.id,
  });
  revalidatePath("/protected/recipes");
  return {
    error,
    data,
  };
}

export async function addToList(
  ingredients:
    | {
        id: number;
        quantity?: number | null;
        unit?: string;
      }[]
    | undefined,
  listId: number
) {
  const schema = z.object({
    ingredients: z
      .array(
        z.object({
          id: z.number(),
          quantity: z.number().optional().nullable(),
          unit: z.string().optional(),
        })
      )
      .optional(),
    listId: z.number(),
  });
  const res = schema.safeParse({ ingredients, listId });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const formattedIngredients = res.data.ingredients?.map(
    ({ id, quantity, unit }) => {
      return {
        ingredient_id: id,
        quantity: quantity,
        unit: unit,
      };
    }
  );
  const { data, error } = await supabase.rpc("upsert_list_ingredient", {
    list_id_param: listId,
    ingredients: formattedIngredients,
  });
  revalidatePath("/protected/list");
  return {
    error,
    data,
  };
}

function isDateBeforeToday(dateString: string) {
  if (!dateString) {
    return true;
  }
  const dateParts = dateString.split("-");
  //@ts-ignore
  const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export async function handleFileSubmit(file: string) {
  const schema = z.object({
    file: z.string(),
  });
  const res = schema.safeParse({ file });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error: userError, data: userData } = await getUserInfos();
  if (
    userError ||
    (!isDateBeforeToday(userData[0].last_ai_use) && !userData[0].premium)
  ) {
    return {
      error: "Impossible d'utiliser l'IA pour le moment",
    };
  }
  const openai = new OpenAI({
    apiKey: process.env.NEXT_OPENAI_API_KEY,
  });
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `
            Je vous envoie une image contenant une recette de cuisine. Veuillez extraire les informations de 
            cette image et les retourner sous forme d'une chaîne JSON structurée. 
            Voici le format souhaité pour la réponse :
              {
                "name": "NomDeLaRecette",
                "count": 1,
                "ingredients": [
                  { "name": "Fraise", "quantity": 3, "unit": "/" },
                  { "name": "Framboise", "quantity": 6, "unit": "g" }
                ],
                "steps": [
                  "Couper les fruits",
                  "Manger les fruits"
                ]
              }
              Détails spécifiques :
                1. Nom de la recette : Doit être extrapolé si non directement mentionné.
                2. Nombre de personnes : Défaut à 1 si non spécifié.
                3. Ingrédients :
                  Liste des ingrédients avec nom, quantité et unité.
                  Corriger les fautes d'orthographe.
                  Les unités possibles : ["g", "kg", "ml", "cl", "L", "c.c", "c.s", "pincées", "gousses", "branches", "gouttes", "tasses", "tranches", "morceaux", "feuilles", "tiges", "bouquets", "sachets", "paquets", "tablettes", "verres", "zestes", "bâtons", "têtes", "filets", "cubes"]. 
                  Si une unité n'est pas trouvée dans cette liste, utilisez "/". 
                  Si une unité similaire est trouvée (par exemple, "sachet" au lieu de "sachets"), utilisez l'unité correcte (une de la liste précédemment fournie)
                  Remplacez "cuillère à soupe" par "c.s" et "cuillère à café" par "c.c".
                  Assurez-vous que l'unité n'est pas incluse dans le nom de l'ingrédient. 
                    Exemple incorrect :
                      { "name": "cuillères à soupe de sucre", "quantity": 5, "unit": "c.s" }
                    Exemple correct :
                      { "name": "sucre", "quantity": 5, "unit": "c.s" }
                  Quantité : Utilisez uniquement des nombres.
                Étapes de préparation : Liste des étapes.
                Langue : Répondez en français et traduisez la recette si nécessaire.
                Erreur : Générer une erreur si aucune recette n'est trouvée dans l'image.
                Réponse : Ne renvoyez que le fichier JSON, sans autre texte.
            `,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${res.data.file}`,
            },
          },
        ],
      },
    ],
  });

  if (response.choices[0].message.content) {
    const responseParsed = JSON.parse(response.choices[0].message.content);
    if (responseParsed.error) {
      return {
        error: responseParsed.error,
      };
    }
    try {
      const promises = responseParsed.ingredients.map(
        async (el: IngredientDetail) => {
          const { error, data: correspondingIngredient } = await supabase.rpc(
            "find_similar_ingredient",
            { input_name: el.name }
          );
          if (error) {
            throw new Error("Error during database ingredient matching");
          }
          let mostSimilarInput = "/";
          if (el.unit) {
            mostSimilarInput = findBestMatch(el.unit, unitList).bestMatch
              .target;
          }
          return {
            name: correspondingIngredient[0].name,
            id: correspondingIngredient[0].id,
            quantity: Number.isInteger(el.quantity) ? el.quantity : 0,
            unit: mostSimilarInput,
          };
        }
      );
      const ingredients = await Promise.all(promises);
      const { error: userError } = await supabase
        .from("user")
        .update({
          last_ai_use: new Date(),
        })
        .eq("id", user.id);
      console.log(userError);
      return {
        error: null,
        data: {
          name: responseParsed.name,
          count: responseParsed.count,
          ingredients: ingredients,
          steps: responseParsed.steps,
        },
      };
    } catch (e) {
      return {
        error: "Impossible d'analyser l'image",
      };
    }
  } else {
    return {
      error: "Could not analyse the content",
    };
  }
}

export async function scrapUrl(url: string) {
  const schema = z.object({
    url: z.string(),
  });
  const res = schema.safeParse({ url });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error: userError, data: userData } = await getUserInfos();
  if (
    userError ||
    (!isDateBeforeToday(userData[0].last_ai_use) && !userData[0].premium)
  ) {
    return {
      error: "Impossible d'utiliser l'IA pour le moment",
    };
  }
  try {
    const responseAxios = await axios.get(res.data.url);
    const html = responseAxios.data;
    // Load the webpage content into cheerio
    const $ = cheerio.load(html);
    const scriptTags = $('script[type="application/ld+json"]');
    let correctData = null;
    scriptTags.each((_, element) => {
      const scriptContent = $(element).html();
      if (/recipeIngredient/.test(JSON.stringify(scriptContent))) {
        if (scriptContent) {
          correctData = decodeUnicode(scriptContent);
        }
      }
    });
    if (!correctData) {
      return {
        error: "Error while analizing the website",
      };
    }
    const openai = new OpenAI({
      apiKey: process.env.NEXT_OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Je vous envoye le contenu d'un site web avec des informations un peu confuses.
                    Je veux que extraire certaines informations et les retourner sous forme d'une chaîne JSON structurée.
                    Voici le format souhaité pour la réponse :
                    {
                      "name": "NomDeLaRecette",
                      "count": 1,
                      "ingredients": [
                        { "name": "Fraise", "quantity": 3, "unit": "/" },
                        { "name": "Framboise", "quantity": 6, "unit": "g" }
                      ],
                      "steps": [
                        "Couper les fruits",
                        "Manger les fruits"
                      ]
                    }
                    Détails spécifiques :
                      1. Nom de la recette : Doit être extrapolé si non directement mentionné.
                      2. Nombre de personnes : Défaut à 1 si non spécifié.
                      3. Ingrédients :
                        Liste des ingrédients avec nom, quantité et unité.
                        Corriger les fautes d'orthographe.
                        Les unités possibles : ["g", "kg", "ml", "cl", "L", "c.c", "c.s", "pincées", "gousses", "branches", "gouttes", "tasses", "tranches", "morceaux", "feuilles", "tiges", "bouquets", "sachets", "paquets", "tablettes", "verres", "zestes", "bâtons", "têtes", "filets", "cubes"]. 
                        Si une unité n'est pas trouvée dans cette liste, utilisez "/". 
                        Si une unité similaire est trouvée (par exemple, "sachet" au lieu de "sachets"), utilisez l'unité correcte (une de la liste précédemment fournie)
                        Remplacez "cuillère à soupe" par "c.s" et "cuillère à café" par "c.c".
                        Assurez-vous que l'unité n'est pas incluse dans le nom de l'ingrédient. 
                          Exemple incorrect :
                            { "name": "cuillères à soupe de sucre", "quantity": 5, "unit": "c.s" }
                          Exemple correct :
                            { "name": "sucre", "quantity": 5, "unit": "c.s" }
                        Quantité : Utilisez uniquement des nombres.
                      Étapes de préparation : Liste des étapes.
                      Langue : Répondez en français et traduisez la recette si nécessaire.
                      Erreur : Générer une erreur si aucune recette n'est trouvée dans l'image.
                      Réponse : Ne renvoyez que le fichier JSON, sans autre texte.
                    `,
            },
            {
              type: "text",
              text: `${correctData}`,
            },
          ],
        },
      ],
    });
    if (response.choices[0].message.content) {
      const responseParsed = JSON.parse(response.choices[0].message.content);
      try {
        const promises = responseParsed.ingredients.map(
          async (el: IngredientDetail) => {
            const { error, data: correspondingIngredient } = await supabase.rpc(
              "find_similar_ingredient",
              { input_name: el.name }
            );
            if (error) {
              throw new Error("Error during database ingredient matching");
            }
            let mostSimilarInput = "/";
            if (el.unit) {
              mostSimilarInput = findBestMatch(el.unit, unitList).bestMatch
                .target;
            }
            return {
              name: correspondingIngredient[0].name,
              id: correspondingIngredient[0].id,
              quantity: Number.isInteger(el.quantity) ? el.quantity : 0,
              unit: mostSimilarInput,
            };
          }
        );
        const ingredients = await Promise.all(promises);
        const { error: userError } = await supabase
          .from("user")
          .update({
            last_ai_use: new Date(),
          })
          .eq("id", user.id);
        console.log(userError);
        return {
          error: null,
          data: {
            name: responseParsed.name,
            count: responseParsed.count,
            ingredients: ingredients,
            steps: responseParsed.steps,
          },
        };
      } catch (e) {
        return {
          error: e,
        };
      }
    } else {
      return {
        error: "Could not analyse the content",
      };
    }
  } catch {
    return {
      error: "Erreur lors du scraping",
    };
  }
}
