import CreationForm from "@/components/CreationForm";
import ErrorScreen from "@/components/ErrorScreen";
import {
  fetchCategories,
  fetchRecipe,
} from "@/serverFunctions/recipe/serverFunctions";

export default async function Page({ params }: { params: { id: number } }) {
  const { error: recipeError, data: recipeData } = await fetchRecipe(
    Number(params.id)
  );
  const { error, data } = await fetchCategories();

  const recipeCategoryMapped = recipeData?.category?.map((el) => el.id);

  const enrichedData = data?.map(({ id, name, active }) => {
    if (recipeCategoryMapped?.includes(id)) {
      return {
        id,
        name,
        active: true,
      };
    }
    return {
      id,
      name,
      active,
    };
  });

  if (error || recipeError) {
    return <ErrorScreen />;
  }

  return (
    <div className="w-full h-[94vh] flex flex-col justify-start items-center gap-y-10 mt-[7vh]">
      <h3 className="text-2xl font-bold">Modification de recette</h3>
      <CreationForm
        id={recipeData.id}
        defaultName={recipeData.name}
        defaultCount={recipeData.counter}
        defaultImage={recipeData.image_url}
        defaultImagePath={recipeData.image_path}
        defaultIngredients={recipeData.ingredients}
        defaultSteps={recipeData.steps}
        defaultCategories={enrichedData}
      />
    </div>
  );
}
