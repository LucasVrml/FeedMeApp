import { weekRecipesPlanned } from "@/app/protected/agenda/page";
import { getPlannedRecipes } from "@/serverFunctions/agenda/serverFunctions";

export async function usePlannedRecipes(offset: number) {
  const current = new Date();
  const startOfWeek = current.getDate() - current.getDay();
  const weekRecipes: weekRecipesPlanned = {};
  const firstDate = new Date(
    current.getFullYear(),
    current.getMonth(),
    startOfWeek + 1 + offset * 14
  );
  const lastDate = new Date(
    current.getFullYear(),
    current.getMonth(),
    startOfWeek + 14 + offset * 14
  );
  const { error, data } = await getPlannedRecipes(firstDate, lastDate);
  if (error) {
    return {
      error,
    };
  }
  for (let i = 0; i < 14; i++) {
    const fullDate = new Date(
      current.getFullYear(),
      current.getMonth(),
      startOfWeek + i + offset * 14
    );
    const fullDateParsed = `${fullDate.getFullYear()}-${String(fullDate.getMonth() + 1).padStart(2, "0")}-${String(fullDate.getDate()).padStart(2, "0")}`;
    const day = new Date(
      current.getFullYear(),
      current.getMonth(),
      startOfWeek + i + offset * 14
    ).toLocaleString("fr-FR", { weekday: "long" });
    const month = new Date(
      current.getFullYear(),
      current.getMonth(),
      startOfWeek + i + offset * 14
    ).toLocaleString("fr-FR", { month: "long" });
    const date = new Date(
      current.getFullYear(),
      current.getMonth(),
      startOfWeek + i + offset * 14
    ).getDate();
    weekRecipes[fullDateParsed] = {
      day,
      fullDate: fullDateParsed,
      date,
      month,
      recipes: [],
    };
  }
  data?.forEach((el) => {
    if (weekRecipes[el.date]?.recipes) {
      weekRecipes[el.date].recipes = [
        //@ts-ignore
        ...weekRecipes[el.date].recipes,
        //@ts-ignore
        { ...el.recipe, count: el.count },
      ];
    }
  });
  return {
    error: null,
    data: weekRecipes,
  };
}
