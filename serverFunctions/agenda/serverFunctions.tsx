"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "../utils/getSupabaseInstance";
import { z } from "zod";

export async function getPlannedRecipes(minDate: Date, maxDate: Date) {
  const schema = z.object({
    minDate: z.date(),
    maxDate: z.date(),
  });
  const res = schema.safeParse({ minDate, maxDate });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { user, supabase } = await getSupabase();
  const { error, data } = await supabase
    .from("recipes_plan")
    .select("date, recipe(id, name), count")
    .lte("date", res.data.maxDate.toISOString().split("T")[0])
    .gte("date", res.data.minDate.toISOString().split("T")[0])
    .eq("user_id", user.id);
  return {
    error,
    data,
  };
}

export async function fetchRecipesSmall() {
  const { supabase, user } = await getSupabase();
  const { error, data } = await supabase
    .from("recipe")
    .select("id, name")
    .eq("user_id", user.id);
  return { error, data };
}

export async function planRecipe(recipe_id: number, date: string) {
  const schema = z.object({
    recipe_id: z.number(),
    date: z.string(),
  });
  const res = schema.safeParse({ recipe_id, date });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { user, supabase } = await getSupabase();
  const { error } = await supabase.from("recipes_plan").insert({
    date: res.data.date,
    user_id: user.id,
    recipe_id: res.data.recipe_id,
  });
  if (error) {
    return { error };
  }
  revalidatePath("/protected/agenda");
  return {
    error: null,
  };
}

export async function unPlanRecipe(recipe_id: number, date: string) {
  const schema = z.object({
    recipe_id: z.number(),
    date: z.string(),
  });
  const res = schema.safeParse({ recipe_id, date });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { user, supabase } = await getSupabase();
  const { error } = await supabase
    .from("recipes_plan")
    .delete()
    .eq("user_id", user.id)
    .eq("recipe_id", res.data.recipe_id)
    .eq("date", res.data.date);
  if (error) {
    return { error };
  }
  revalidatePath("/protected/agenda");
  return {
    error: null,
  };
}

export async function unPlanAllRecipe(date: string) {
  const schema = z.object({
    date: z.string(),
  });
  const res = schema.safeParse({ date });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { user, supabase } = await getSupabase();
  const { error } = await supabase
    .from("recipes_plan")
    .delete()
    .eq("user_id", user.id)
    .eq("date", res.data.date);
  if (error) {
    return { error };
  }
  revalidatePath("/protected/agenda");
  return {
    error: null,
  };
}

export async function updateCount(
  recipe_id: number,
  date: string,
  newCount: number
) {
  const schema = z.object({
    recipe_id: z.number(),
    date: z.string(),
    newCount: z.number(),
  });
  const res = schema.safeParse({ recipe_id, date, newCount });
  if (!res.success) {
    const { errors } = res.error;
    return { error: errors };
  }
  const { user, supabase } = await getSupabase();
  const { error } = await supabase
    .from("recipes_plan")
    .update({
      count: res.data.newCount,
    })
    .eq("user_id", user.id)
    .eq("recipe_id", res.data.recipe_id)
    .eq("date", res.data.date);
  if (error) {
    return { error };
  }
  revalidatePath("/protected/agenda");
  return {
    error: null,
  };
}
