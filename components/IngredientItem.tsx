"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Trash } from "lucide-react";
import { IngredientDetail } from "@/database.types";
import { Card } from "./ui/card";

export const unitList = [
  "/",
  "g",
  "kg",
  "ml",
  "cl",
  "L",
  "c.c",
  "c.s",
  "pincée(s)",
  "gousse(s)",
  "branche(s)",
  "goutte(s)",
  "tasse(s)",
  "tranche(s)",
  "morceaux",
  "feuille(s)",
  "tige(s)",
  "bouquet(s)",
  "sachet(s)",
  "paquet(s)",
  "tablette(s)",
  "verre(s)",
  "zeste(s)",
  "bâton(s)",
  "tête(s)",
  "filet(s)",
  "cube(s)",
];

const IngredientItem = ({
  ingredient,
  ingredients,
  setIngredients,
}: {
  ingredient: IngredientDetail;
  ingredients: IngredientDetail[];
  setIngredients: Function;
}) => {
  const [quantity, setQuantity] = useState(ingredient.quantity || null);
  const [unit, setUnit] = useState(ingredient.unit || undefined);

  function handleChangeQuantity(ev: React.ChangeEvent<HTMLInputElement>) {
    const count = Number(ev.target.value);
    if (!isNaN(count) || ev.target.value === "") {
      if (count > 0) {
        setQuantity(count);
        changeQuantityIngredients(count);
      } else {
        if (ev.target.value === "") {
          setQuantity(0);
          changeQuantityIngredients(0);
        }
      }
    }
  }

  function changeQuantityIngredients(count: number) {
    const newIngredients = ingredients.map((el) => {
      if (el.id === ingredient.id) {
        return {
          ...el,
          quantity: count,
        };
      }
      return el;
    });
    setIngredients(newIngredients);
  }

  function changeUnitIngredients(newUnit: string) {
    setUnit(newUnit);
    const newIngredients = ingredients.map((el) => {
      if (el.id === ingredient.id) {
        return {
          ...el,
          unit: newUnit,
        };
      }
      return el;
    });
    setIngredients(newIngredients);
  }

  function deleteIngredient() {
    const newIngredients = ingredients.filter(
      (item) => item.id !== ingredient.id
    );
    setIngredients(newIngredients);
  }

  return (
    <div className="grid grid-cols-6 gap-x-2 w-full items-center content-start">
      <Card className="col-span-3 text-center capitalize bg-primary/50 h-full flex justify-center items-center">
        {ingredient.name}
      </Card>
      <Input
        value={quantity || undefined}
        onChange={handleChangeQuantity}
        className="col-span-1"
      />
      <Select value={unit} onValueChange={(el) => changeUnitIngredients(el)}>
        <SelectTrigger className="col-span-1">
          <SelectValue placeholder="Unité" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {unitList.map((el) => {
              return <SelectItem value={el}>{el}</SelectItem>;
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex justify-center items-center col-span-1">
        <div
          onClick={deleteIngredient}
          className="flex justify-center items-center cursor-pointer transition-all p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800"
        >
          <Trash size={20} />
        </div>
      </div>
    </div>
  );
};

export default IngredientItem;
