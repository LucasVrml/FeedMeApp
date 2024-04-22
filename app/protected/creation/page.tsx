import CreationForm from "@/components/CreationForm";
import ErrorScreen from "@/components/ErrorScreen";
import { Category } from "@/database.types";
import { getUserInfos } from "@/serverFunctions/auth/serverFunctions";
import { fetchCategories } from "@/serverFunctions/recipe/serverFunctions";

export default async function Page() {
  const { error, data } = await fetchCategories();
  const { error: userError, data: userData } = await getUserInfos();

  if (error || userError) {
    return <ErrorScreen />;
  }

  return (
    <div className="w-full h-[94vh] flex flex-col justify-start items-center gap-y-10 mt-[7vh]">
      <h3 className="text-2xl font-bold">Création de recette</h3>
      <CreationForm
        isCreation={true}
        defaultCategories={data as Category[]}
        userInfos={userData}
      />
    </div>
  );
}
