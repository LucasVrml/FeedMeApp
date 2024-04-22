import AgendaPanel from "@/components/AgendaPanel";
import ErrorScreen from "@/components/ErrorScreen";
import { usePlannedRecipes } from "@/hooks/usePlannedRecipes";
import { fetchRecipesSmall } from "@/serverFunctions/agenda/serverFunctions";
import { fetchListsIds } from "@/serverFunctions/list/serverFunctions";

export type weekRecipesPlanned = {
  [key: string]: {
    day: string;
    date: number;
    month: string;
    fullDate: string;
    recipes: {
      id: number;
      name: string;
      count: number;
    }[];
  };
};

const AgendaPage = async () => {
  const { error, data: weekRecipes } = await usePlannedRecipes(0);
  const { error: error2, data: allRecipes } = await fetchRecipesSmall();
  const { error: error3, data: listsIds } = await fetchListsIds();

  if (error || error2 || error3) {
    return <ErrorScreen />;
  }

  return (
    <div className="w-full h-full flex justify-center items-center relative">
      <AgendaPanel
        weekRecipes={weekRecipes}
        allRecipes={allRecipes}
        // @ts-ignore
        listIds={listsIds}
      />
    </div>
  );
};

export default AgendaPage;
