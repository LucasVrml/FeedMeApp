"use client";

import { Category, FormattedRecipe } from "@/database.types";
import { CheckBoxWithText } from "./CheckBoxWithText";
import { Badge } from "./ui/badge";
import {
  addRecipeCategory,
  removeRecipeCategory,
} from "@/serverFunctions/recipe/serverFunctions";
import { useResponseMiddleware } from "@/hooks/useResponseMiddleware";
import { useToast } from "./ui/use-toast";
import Image from "next/image";
import { useEffect, useState } from "react";

const DetailedRecipe = ({
  recipe,
  chosenCount,
  categories,
}: {
  recipe: FormattedRecipe | undefined;
  chosenCount: number;
  categories?: Category[];
}) => {
  const { toast } = useToast();
  const [recipeState, setRecipeState] = useState(recipe);

  useEffect(() => {
    setRecipeState(recipe);
  }, [recipe]);

  async function handleCategoryClick(id: number, name: string, add: boolean) {
    if (recipeState) {
      if (add) {
        const newRecipe = { ...recipeState };
        newRecipe.category = [
          ...(newRecipe.category || []),
          {
            id,
            name,
          },
        ];
        setRecipeState(newRecipe);
        const { error } = await addRecipeCategory(recipeState.id, id);
        useResponseMiddleware({ error }, toast);
      } else {
        const newRecipe = { ...recipeState };
        newRecipe.category = newRecipe.category?.filter((el) => el.id !== id);
        setRecipeState(newRecipe);
        const { error } = await removeRecipeCategory(recipeState.id, id);
        useResponseMiddleware({ error }, toast);
      }
    }
  }

  if (recipeState) {
    return (
      <div className="p-0 w-full h-full flex flex-col justify-start items-center gap-y-7">
        <h1 className="text-4xl font-bold capitalize text-center">
          {recipeState?.name}
        </h1>
        <div className="flex justify-center items-center gap-2 w-full">
          <div className="flex justify-center items-center gap-2 flex-wrap w-full">
            {categories?.map(({ id, name }) => {
              if (recipeState.category?.map((el) => el.id).includes(id)) {
                return (
                  <Badge
                    onClick={() => handleCategoryClick(id, name, false)}
                    key={id}
                    variant="default"
                  >
                    {name}
                  </Badge>
                );
              }
              return (
                <Badge
                  onClick={() => handleCategoryClick(id, name, true)}
                  key={id}
                  variant={"outline"}
                >
                  {name}
                </Badge>
              );
            })}
          </div>
        </div>
        {recipeState.image_url && (
          <Image
            className="rounded-3xl"
            src={recipeState.image_url}
            alt="Photo de la recette"
            width={500}
            height={500}
          />
        )}
        <h4 className="text-xl font-bold">Ingrédients</h4>
        <div className="w-full flex flex-col justify-center items-start gap-y-3 pb-10">
          {recipeState?.ingredients.map(({ id, name, unit, quantity }) => {
            if (quantity && unit && unit !== "/") {
              const formattedQuantities =
                Math.round(
                  quantity * (chosenCount / recipeState.counter) * 100
                ) / 100;
              return (
                <CheckBoxWithText
                  key={id}
                  id={id}
                  text={`${formattedQuantities} ${unit} ${name}`}
                />
              );
            }
            if (quantity && (!unit || unit === "/")) {
              const formattedQuantities =
                Math.round(
                  quantity * (chosenCount / recipeState.counter) * 100
                ) / 100;
              return (
                <CheckBoxWithText
                  key={id}
                  id={id}
                  text={`${formattedQuantities} ${name}`}
                />
              );
            }
            if (!quantity) {
              return <CheckBoxWithText key={id} id={id} text={`${name}`} />;
            }
          })}
        </div>
        <h4 className="text-xl font-bold capitalize">étapes</h4>
        <div className="w-full flex flex-col justify-center items-start gap-y-3 pb-10">
          {recipeState?.steps.map((el) => {
            return <CheckBoxWithText key={el} text={el} />;
          })}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default DetailedRecipe;
