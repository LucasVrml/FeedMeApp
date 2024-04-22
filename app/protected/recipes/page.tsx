"use server";

import ErrorScreen from "@/components/ErrorScreen";
import RecipePanel from "@/components/RecipePanel";
import { Category } from "@/database.types";
import { fetchListsIds } from "@/serverFunctions/list/serverFunctions";
import {
  fetchCategories,
  fetchRecipes,
} from "@/serverFunctions/recipe/serverFunctions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const Recipes = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }
  const { error: recipeError, data: recipeData } = await fetchRecipes();
  const { error, data } = await fetchCategories();
  const { error: error2, data: listsIds } = await fetchListsIds();

  if (error || recipeError || error2) {
    return <ErrorScreen />;
  }

  return (
    <div className="flex w-full h-full justify-center items-center">
      {recipeData ? (
        <RecipePanel
          recipesData={recipeData}
          categories={data as Category[]}
          // @ts-ignore
          listIds={listsIds}
        />
      ) : (
        <RecipePanel
          recipesData={[]}
          categories={data as Category[]}
          // @ts-ignore
          listIds={listsIds}
        />
      )}
    </div>
  );
};

export default Recipes;
