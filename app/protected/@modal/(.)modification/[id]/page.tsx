import CreationForm from "@/components/CreationForm";
import ErrorScreen from "@/components/ErrorScreen";
import Modal from "@/components/Modal";
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
    return (
      <Modal title="Modification de recette">
        <ErrorScreen />;
      </Modal>
    );
  }

  return (
    <Modal title="Modification de recette">
      <CreationForm
        id={recipeData.id}
        inModal={true}
        isCreation={false}
        defaultName={recipeData.name}
        defaultCount={recipeData.counter}
        defaultImage={recipeData.image_url}
        defaultImagePath={recipeData.image_path}
        defaultIngredients={recipeData.ingredients}
        defaultSteps={recipeData.steps}
        defaultCategories={enrichedData}
      />
    </Modal>
  );
}
