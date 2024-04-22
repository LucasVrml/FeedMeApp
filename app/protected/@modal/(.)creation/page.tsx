import CreationForm from "@/components/CreationForm";
import ErrorScreen from "@/components/ErrorScreen";
import Modal from "@/components/Modal";
import { Category } from "@/database.types";
import { getUserInfos } from "@/serverFunctions/auth/serverFunctions";
import { fetchCategories } from "@/serverFunctions/recipe/serverFunctions";

export default async function Page() {
  const { error, data } = await fetchCategories();
  const { error: userError, data: userData } = await getUserInfos();

  if (error || userError) {
    return (
      <Modal title="Création de recette">
        <ErrorScreen />;
      </Modal>
    );
  }

  return (
    <Modal title="Création de recette">
      <CreationForm
        inModal={true}
        isCreation={true}
        defaultCategories={data as Category[]}
        userInfos={userData}
      />
    </Modal>
  );
}
