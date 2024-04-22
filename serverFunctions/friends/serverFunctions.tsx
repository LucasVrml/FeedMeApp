"use server";

import {
  FormattedRecipe,
  IngredientDetail,
  RecipesGroupedByUser,
  askingFriendsType,
  friendsRecipes,
} from "@/database.types";
import { getSupabase } from "../utils/getSupabaseInstance";
import { createRecipe } from "../recipe/serverFunctions";
import { formatIngredients } from "../utils/formaIngredients";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function fetchAllFriendRecipesGroupedByFriend(): Promise<RecipesGroupedByUser> {
  const { supabase, user } = await getSupabase();
  const { error, data: friendsData } = await supabase
    .from("friendship")
    .select("*")
    .or(`user_1.eq.${user.id},user_2.eq.${user.id}`);
  if (!friendsData || error) {
    return {
      error: error,
    };
  }
  const friendIds: string[] = friendsData
    .filter(({ is_accepted }) => is_accepted)
    .map(({ user_1, user_2 }) => (user_1 === user.id ? user_2 : user_1));
  const askingFriendIds: string[] = friendsData
    .filter(({ is_accepted, user_2 }) => !is_accepted && user_2 === user.id)
    .map(({ user_1 }) => user_1);
  let askingFriends: askingFriendsType = {};
  if (askingFriendIds.length > 0) {
    const { error: askingUserError, data: askingUserData } = await supabase
      .from("user")
      .select("id, first_name, last_name")
      .in("id", askingFriendIds);
    if (askingUserError) {
      return {
        error: askingUserError,
      };
    }
    askingUserData?.forEach((el) => {
      askingFriends[el.id] = {
        id: el.id,
        first_name: el.first_name,
        last_name: el.last_name,
      };
    });
  }
  if (friendIds.length > 0) {
    const { error: userError, data: userData } = await supabase
      .from("user")
      .select("id, first_name, last_name")
      .in("id", friendIds);
    if (userError) {
      return {
        error: userError,
      };
    }
    const { error, data } = await supabase
      .from("recipe")
      .select(
        "id, name, counter, image_url, image_path, steps, category(id, name), recipe_ingredient (quantity, unit, ingredient (id, name)), user_id (id, first_name, last_name)"
      )
      .in("user_id", friendIds);
    if (error) {
      return {
        error,
      };
    }
    // @ts-ignore
    const recipesData = formatIngredients(data) as FormattedRecipe[];
    const formattedData: friendsRecipes = {};
    userData.forEach((el) => {
      formattedData[el.id] = {
        user_id: el.id,
        user_first_name: el.first_name,
        user_last_name: el.last_name,
        recipes: [],
      };
    });
    recipesData.forEach((el) => {
      if (el.user_id) {
        const current = formattedData[el.user_id.id].recipes;
        if (current && current.length > 0) {
          formattedData[el.user_id.id].recipes = [...current, el];
        } else {
          formattedData[el.user_id.id].recipes = [el];
        }
      }
    });
    return {
      error,
      recipeData: formattedData,
      askingFriends: askingFriends,
    };
  } else {
    return {
      error: null,
      recipeData: {},
      askingFriends: askingFriends,
    };
  }
}

export async function importRecipe(
  name: string,
  count: number,
  ingredients: IngredientDetail[],
  steps: string[],
  image_path?: string,
  image_url?: string
) {
  const schema = z.object({
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
    image_path: z.string().optional().nullable(),
    image_url: z.string().optional().nullable(),
  });
  const res = schema.safeParse({
    name,
    count,
    ingredients,
    steps,
    image_path,
    image_url,
  });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { error } = await createRecipe(
    res.data.name,
    res.data.count,
    res.data.ingredients,
    res.data.steps,
    [],
    null,
    res.data.image_path,
    res.data.image_url,
    true
  );
  return {
    error,
  };
}

export async function acceptFriend(sender_id: string) {
  const schema = z.object({
    sender_id: z.string(),
  });
  const res = schema.safeParse({ sender_id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error } = await supabase
    .from("friendship")
    .update({ is_accepted: true })
    .eq("user_1", res.data.sender_id)
    .eq("user_2", user.id);
  if (error) {
    return {
      error,
    };
  }
  revalidatePath("/protected/friends");
  return {
    error: null,
  };
}

export async function refuseFriend(sender_id: string) {
  const schema = z.object({
    sender_id: z.string(),
  });
  const res = schema.safeParse({ sender_id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error } = await supabase
    .from("friendship")
    .delete()
    .eq("user_1", res.data.sender_id)
    .eq("user_2", user.id);
  if (error) {
    return {
      error,
    };
  }
  revalidatePath("/protected/friends");
  return {
    error: null,
  };
}

export async function fetchNewFriends(search: string) {
  const schema = z.object({
    search: z.string(),
  });
  const res = schema.safeParse({ search });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase
    .from("user")
    .select("id, full_name, username")
    .ilike("full_name", `%${res.data.search}%`)
    .neq("id", user.id)
    .limit(50);
  return { error, data };
}

export async function addNewFriend(receiver_id: string) {
  const schema = z.object({
    receiver_id: z.string(),
  });
  const res = schema.safeParse({ receiver_id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase
    .from("friendship")
    .select("*")
    .or(
      `and(user_1.eq.${user.id},user_2.eq.${res.data.receiver_id}),and(user_1.eq.${res.data.receiver_id},user_2.eq.${user.id})`
    );
  if (data && data.length) {
    return {
      error: "Already friend with her/him or pending invitation",
    };
  }
  const { error: insertError } = await supabase.from("friendship").insert({
    user_1: user.id,
    user_2: res.data.receiver_id,
    is_accepted: false,
  });
  if (insertError) {
    return {
      error: insertError,
    };
  }
  revalidatePath("/protected/friends");
  return {
    error: null,
  };
}

export async function deleteFriend(friend_id: string) {
  const schema = z.object({
    friend_id: z.string(),
  });
  const res = schema.safeParse({ friend_id });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { supabase, user } = await getSupabase();
  const { error } = await supabase
    .from("friendship")
    .delete()
    .or(
      `and(user_1.eq.${user.id},user_2.eq.${res.data.friend_id}),and(user_1.eq.${res.data.friend_id},user_2.eq.${user.id})`
    );
  if (error) {
    return {
      error,
    };
  }
  revalidatePath("/protected/friends");
  return {
    error: null,
  };
}

export async function getAskingFriendsIds() {
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase
    .from("friendship")
    .select("*")
    .or(`user_1.eq.${user.id},user_2.eq.${user.id}`);
  if (error) {
    return {
      error,
    };
  }
  const askingFriendIds: string[] = data
    .filter(({ is_accepted, user_2 }) => !is_accepted && user_2 === user.id)
    .map(({ user_1 }) => user_1);
  return {
    error: null,
    data: askingFriendIds,
  };
}

export async function getFriends() {
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase
    .from("friendship")
    .select("*")
    .or(`user_1.eq.${user.id},user_2.eq.${user.id}`);
  if (error) {
    return {
      error,
    };
  }
  const friendIds: string[] = data
    .filter(({ is_accepted }) => is_accepted)
    .map(({ user_1, user_2 }) => (user_1 === user.id ? user_2 : user_1));
  const { error: friendsError, data: friendsData } = await supabase
    .from("user")
    .select("id, first_name, last_name")
    .in("id", friendIds);
  if (friendsError) {
    return {
      error: friendsError,
    };
  }
  return {
    error: null,
    data: friendsData,
  };
}
