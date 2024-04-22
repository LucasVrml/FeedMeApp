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

  async function handleCategoryClick(id: number, add: boolean) {
    if (recipe) {
      if (add) {
        const { error } = await addRecipeCategory(recipe.id, id);
        useResponseMiddleware({ error }, toast);
      } else {
        const { error } = await removeRecipeCategory(recipe.id, id);
        useResponseMiddleware({ error }, toast);
      }
    }
  }

  if (recipe) {
    return (
      <div className="p-0 w-full h-full flex flex-col justify-start items-center gap-y-7">
        <h1 className="text-4xl font-bold capitalize text-center">
          {recipe?.name}
        </h1>
        <div className="flex justify-center items-center gap-2 w-full">
          <div className="flex justify-center items-center gap-2 flex-wrap w-full">
            {categories?.map(({ id, name }) => {
              if (recipe.category?.map((el) => el.id).includes(id)) {
                return (
                  <Badge
                    onClick={() => handleCategoryClick(id, false)}
                    key={id}
                    variant="default"
                  >
                    {name}
                  </Badge>
                );
              }
              return (
                <Badge
                  onClick={() => handleCategoryClick(id, true)}
                  key={id}
                  variant={"outline"}
                >
                  {name}
                </Badge>
              );
            })}
          </div>
        </div>
        {recipe.image_url && (
          <Image
            className="rounded-3xl"
            src={recipe.image_url}
            alt="Photo de la recette"
            width={500}
            height={500}
          />
        )}
        <h4 className="text-xl font-bold">Ingrédients</h4>
        <div className="w-full flex flex-col justify-center items-start gap-y-3 pb-10">
          {recipe?.ingredients.map(({ id, name, unit, quantity }) => {
            if (quantity && unit && unit !== "/") {
              const formattedQuantities =
                Math.round(quantity * (chosenCount / recipe.counter) * 100) /
                100;
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
                Math.round(quantity * (chosenCount / recipe.counter) * 100) /
                100;
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
          {recipe?.steps.map((el) => {
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
