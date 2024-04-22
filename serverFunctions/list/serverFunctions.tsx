"use server";

import {
  AdditionalListIngredient,
  ListIngredient,
  ListItem,
} from "@/database.types";
import { revalidatePath } from "next/cache";
import { getSupabase } from "../utils/getSupabaseInstance";
import { z } from "zod";

export async function fetchLists() {
  const { supabase, user } = await getSupabase();
  const { data, error } = await supabase.rpc(
    "get_user_lists_with_ingredients_and_users_and_additional_ingred",
    { p_user_id: user.id }
  );
  if (error) {
    return {
      error,
    };
  }
  return {
    error: null,
    data,
  };
}

export async function fetchListsIds() {
  const { supabase, user } = await getSupabase();
  const { data, error } = await supabase
    .from("list_user")
    .select("list(id, name, personal)")
    .eq("user_id", user.id);
  if (error) {
    return {
      error,
    };
  }
  return {
    error: null,
    data,
  };
}

export async function insertNewAdditionalListItem(
  newElement: AdditionalListIngredient
) {
  const schema = z.object({
    list_id: z.number(),
    id: z.number().optional(),
    name: z.string(),
    checked: z.boolean(),
  });
  const res = schema.safeParse(newElement);
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { data, error } = await supabase
    .from("list_additional_ingredients")
    .insert({ ...res.data })
    .select();
  revalidatePath("protected/list");
  return { data, error };
}

export async function clearList(list_id: number) {
  const schema = z.object({
    list_id: z.number(),
  });
  const res = schema.safeParse({ list_id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error } = await supabase
    .from("list_ingredient")
    .delete()
    .eq("list_id", res.data.list_id);
  if (error) {
    return {
      error,
    };
  }
  const { error: secondError } = await supabase
    .from("list_additional_ingredients")
    .delete()
    .eq("list_id", res.data.list_id);
  if (secondError) {
    return {
      error: secondError,
    };
  }
  revalidatePath("protected/list");
  return {
    error: null,
  };
}

export async function setCheckedListItem(
  list_id: number,
  ingredient_id: number,
  checkValue: boolean
) {
  const schema = z.object({
    list_id: z.number(),
    ingredient_id: z.number(),
    checkValue: z.boolean(),
  });
  const res = schema.safeParse({ list_id, ingredient_id, checkValue });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error } = await supabase
    .from("list_ingredient")
    .update({
      checked: res.data.checkValue,
    })
    .eq("list_id", res.data.list_id)
    .eq("ingredient_id", res.data.ingredient_id);
  revalidatePath("protected/list");
  return {
    error,
  };
}

export async function setCheckedAdditionalListItem(
  list_id: number,
  ingredient_id: number,
  checkValue: boolean
) {
  const schema = z.object({
    list_id: z.number(),
    ingredient_id: z.number(),
    checkValue: z.boolean(),
  });
  const res = schema.safeParse({ list_id, ingredient_id, checkValue });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error } = await supabase
    .from("list_additional_ingredients")
    .update({
      checked: res.data.checkValue,
    })
    .eq("list_id", res.data.list_id)
    .eq("id", res.data.ingredient_id);
  revalidatePath("protected/list");
  return {
    error,
  };
}

export async function deleteListItem(list_id: number, ingredient_id: number) {
  const schema = z.object({
    list_id: z.number(),
    ingredient_id: z.number(),
  });
  const res = schema.safeParse({ list_id, ingredient_id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  revalidatePath("protected/list");
  return await supabase
    .from("list_ingredient")
    .delete()
    .eq("list_id", res.data.list_id)
    .eq("ingredient_id", res.data.ingredient_id);
}

export async function deleteAdditionalListItem(
  list_id: number,
  ingredient_id: number
) {
  const schema = z.object({
    list_id: z.number(),
    ingredient_id: z.number(),
  });
  const res = schema.safeParse({ list_id, ingredient_id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  revalidatePath("protected/list");
  return await supabase
    .from("list_additional_ingredients")
    .delete()
    .eq("list_id", res.data.list_id)
    .eq("id", res.data.ingredient_id);
}

export async function createList(name: string, user_ids: string[]) {
  const schema = z.object({
    name: z.string(),
    user_ids: z.string().array().nullable(),
  });
  const res = schema.safeParse({ name, user_ids });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase
    .from("list")
    .insert({
      name: res.data.name,
    })
    .select("id");
  if (error) {
    return {
      error,
    };
  }
  try {
    const promises = res.data.user_ids?.map(async (id) => {
      const { error } = await supabase.from("list_user").insert({
        list_id: data[0].id,
        user_id: id,
      });
      if (error) {
        throw new Error("Error during database ingredient matching");
      }
    });
    if (promises) {
      await Promise.all(promises);
      const { error } = await supabase.from("list_user").insert({
        list_id: data[0].id,
        user_id: user.id,
      });
      if (error) {
        return {
          error,
        };
      }
    }
  } catch {
    return {
      error: "ça marche pas",
    };
  }
  revalidatePath("/protected/list");
  return {
    error: null,
  };
}

export async function leaveList(list_id: number) {
  const schema = z.object({
    list_id: z.number(),
  });
  const res = schema.safeParse({ list_id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error } = await supabase
    .from("list_user")
    .delete()
    .eq("list_id", res.data.list_id)
    .eq("user_id", user.id);
  if (error) {
    return {
      error,
    };
  }
  revalidatePath("/protected/list");
  return {
    error: null,
  };
}

export async function addFriendToList(list_id: number, id: string) {
  const schema = z.object({
    list_id: z.number(),
    id: z.string(),
  });
  const res = schema.safeParse({ list_id, id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error } = await supabase.from("list_user").insert({
    list_id: res.data.list_id,
    user_id: res.data.id,
  });
  if (error) {
    return {
      error,
    };
  }
  revalidatePath("/protected/list/");
  return {
    error: null,
  };
}
