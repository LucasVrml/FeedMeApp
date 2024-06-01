import {
  planRecipe,
  unPlanAllRecipe,
  unPlanRecipe,
  updateCount,
} from "@/serverFunctions/agenda/serverFunctions";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { FormattedRecipe, allRecipes } from "@/database.types";
import { useResponseMiddleware } from "@/hooks/useResponseMiddleware";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  addToList,
  fetchRecipe,
} from "@/serverFunctions/recipe/serverFunctions";

const DatePicker = ({
  setFocusedDateRecipes,
  plannedRecipes,
  allRecipes,
  selectedDate,
  listIds,
}: {
  setFocusedDateRecipes: Function;
  plannedRecipes: { id: number; name: string; count: number }[];
  allRecipes: allRecipes;
  selectedDate: string;
  listIds: { list: { id: number; personal: boolean; name: string } }[];
}) => {
  const { toast } = useToast();

  async function handlePlanRecipe(recipe_id: number, recipe_name: string) {
    if (plannedRecipes) {
      const newRecipes = [
        ...plannedRecipes,
        {
          id: recipe_id,
          name: recipe_name,
          count: 1,
        },
      ];
      setFocusedDateRecipes(newRecipes);
    } else {
      setFocusedDateRecipes([
        {
          id: recipe_id,
          name: recipe_name,
          count: 1,
        },
      ]);
    }
    const { error } = await planRecipe(recipe_id, selectedDate);
    const res = useResponseMiddleware({ error }, toast);
  }

  async function handleUnPlanRecipe(recipe_id: number) {
    const newRecipes = plannedRecipes?.filter((el) => el.id !== recipe_id);
    setFocusedDateRecipes(newRecipes);
    const { error } = await unPlanRecipe(recipe_id, selectedDate);
    const res = useResponseMiddleware({ error }, toast);
  }

  async function handleUnPlanAllRecipes() {
    setFocusedDateRecipes([]);
    const { error } = await unPlanAllRecipe(selectedDate);
    const res = useResponseMiddleware({ error }, toast);
  }

  async function handleIncreaseCount(recipe_id: number, newCount: number) {
    const newRecipes = plannedRecipes?.map((el) => {
      if (el.id === recipe_id) {
        return {
          ...el,
          count: el.count + 1,
        };
      }
      return el;
    });
    setFocusedDateRecipes(newRecipes);
    const { error } = await updateCount(recipe_id, selectedDate, newCount);
    const res = useResponseMiddleware({ error }, toast);
  }

  async function handleDecreaseCount(recipe_id: number, newCount: number) {
    const newRecipes = plannedRecipes?.map((el) => {
      if (el.id === recipe_id) {
        return {
          ...el,
          count: el.count - 1,
        };
      }
      return el;
    });
    setFocusedDateRecipes(newRecipes);
    const { error } = await updateCount(recipe_id, selectedDate, newCount);
    const res = useResponseMiddleware({ error }, toast);
  }

  async function handleAddToList(listId: number) {
    try {
      plannedRecipes.forEach(async (recipe) => {
        const { error: recipeError, data: recipeData } = await fetchRecipe(
          recipe.id
        );
        const res: FormattedRecipe | null = useResponseMiddleware(
          { error: recipeError, data: recipeData },
          toast
        );
        if (!res) {
          throw new Error("ça marche pas");
        }
        const formattedIngredients = res.ingredients?.map(
          ({ id, quantity, unit }) => {
            let formattedQuantities = null;
            if (quantity) {
              formattedQuantities =
                Math.round(quantity * (recipe.count / res.counter) * 100) / 100;
            }
            return {
              id,
              quantity: formattedQuantities,
              unit,
            };
          }
        );
        const { error } = await addToList(formattedIngredients, listId);
        const res2 = useResponseMiddleware({ error }, toast);
        if (!res2) {
          throw new Error("ça marche pas");
        }
      });
      toast({
        title: "Parfait !",
        description: "Les ingrédients on été ajoutés à la liste !",
        duration: 2500,
      });
    } catch (e) {
      toast({
        title: "Mince ...",
        description: "Problème lors de la génération des listes",
        duration: 2500,
      });
    }
  }

  return (
    <div className="flex flex-col justify-start items-center w-full h-full gap-y-4">
      <div className="flex flex-col justify-start items-center w-full h-[55vh] overflow-y-scroll noscrollbar">
        <div className="flex flex-col justify-start items-start w-full gap-y-2 p-1">
          {plannedRecipes?.map(({ id, name, count }) => {
            return (
              <div className="w-full grid grid-cols-6 gap-x-4">
                <Card
                  key={id}
                  className="col-span-4 py-2 cursor-pointer flex justify-center items-center capitalize bg-primary/50"
                  onClick={async () => handleUnPlanRecipe(id)}
                >
                  {name}
                </Card>
                <div className="col-span-2 scale-90 flex justify-center items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => {
                      if (count > 1) {
                        handleDecreaseCount(id, count - 1);
                      }
                    }}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Decrease</span>
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="text-xl font-bold tracking-tighter">
                      {count}
                    </div>
                    <div className="text-[0.70rem] uppercase text-muted-foreground">
                      Personne(s)
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => handleIncreaseCount(id, count + 1)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Increase</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col justify-start items-center w-full gap-y-2 p-1 px-3">
          {allRecipes
            ?.filter(
              (el) => !plannedRecipes?.map((item) => item.id).includes(el.id)
            )
            .map(({ id, name }) => {
              return (
                <Card
                  key={id}
                  className="w-full py-2 cursor-pointer hover:bg-muted flex justify-center items-center capitalize"
                  onClick={async () => handlePlanRecipe(id, name)}
                >
                  {name}
                </Card>
              );
            })}
        </div>
      </div>
      <div className="flex justify-center items-center gap-x-4 h-[5vh]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="hover:bg-primary/50">
              Générer une liste pour cette date
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Ajouter à quelle liste ?</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {listIds.map((el) => (
              <DropdownMenuItem
                className="cursor-pointer"
                key={el.list.id}
                onClick={() => handleAddToList(el.list.id)}
              >
                {el.list.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          onClick={() => {
            handleUnPlanAllRecipes();
          }}
        >
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

export default DatePicker;
