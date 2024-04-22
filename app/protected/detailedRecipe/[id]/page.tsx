import ErrorScreen from "@/components/ErrorScreen";
import RecipePanel from "@/components/RecipePanel";
import { Button } from "@/components/ui/button";
import { Category } from "@/database.types";
import { fetchListsIds } from "@/serverFunctions/list/serverFunctions";
import {
  fetchCategories,
  fetchRecipe,
} from "@/serverFunctions/recipe/serverFunctions";
import Link from "next/link";

const DetailedRecipe = async ({ params }: { params: { id: number } }) => {
  const { error: recipeError, data: recipeData } = await fetchRecipe(
    Number(params.id)
  );
  const { error, data } = await fetchCategories();
  const { error: error2, data: listsIds } = await fetchListsIds();

  if (recipeError || error2 || error) {
    return <ErrorScreen />;
  }

  return (
    <div className="flex w-full h-full justify-center items-center">
      {recipeData ? (
        <RecipePanel
          recipesData={[recipeData]}
          onlyRecipe={true}
          categories={data as Category[]}
          //@ts-ignore
          listIds={listsIds}
        />
      ) : (
        //@ts-ignore
        <div className="flex flex-col w-full h-full justify-center items-center gap-y-4">
          La recette n'existe pas ou vous n'y avez pas accès
          <Link href="/protected/recipes" passHref>
            <Button variant="outline">Revenir aux recettes</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DetailedRecipe;
