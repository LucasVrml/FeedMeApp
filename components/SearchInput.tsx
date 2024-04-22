"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { fetchIngredientsSearch } from "@/serverFunctions/recipe/serverFunctions";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { IngredientDetail } from "@/database.types";
import { useResponseMiddleware } from "@/hooks/useResponseMiddleware";
import { useToast } from "./ui/use-toast";

export function SearchInput({
  ingredients,
  setIngredients,
}: {
  ingredients: IngredientDetail[];
  setIngredients: Function;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [items, setItems] = useState<IngredientDetail[] | undefined>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  function handleValueChange(search: string) {
    setValue(search);
    setLoading(true);
  }

  function handleOnSelect(id: number, name: string) {
    setValue("");
    setIngredients((prev: IngredientDetail[]) => [
      ...prev,
      {
        id,
        name,
        quantity: 1,
        unit: "",
      },
    ]);
    setOpen(false);
  }

  useEffect(() => {
    const fetchValues = async (value: string) => {
      const { error, data } = await fetchIngredientsSearch(value);
      const res = useResponseMiddleware({ error, data }, toast);
      if (res) {
        const result = res?.filter(
          //@ts-ignore
          (el) => !ingredients?.map((item) => item.id).includes(el.id)
        );
        setItems(result);
      }
      setLoading(false);
    };
    fetchValues(value);
  }, [value, open]);

  return (
    <div className="w-full flex justify-center">
      <Button variant={"outline"} onClick={() => setOpen(true)}>
        Ajouter un ingrédient
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Rechercher un ingrédient ..."
          value={value}
          onValueChange={handleValueChange}
        />
        <CommandList className="noscrollbar">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {items?.map(({ id, name }) => {
              return (
                <CommandItem key={id} onSelect={() => handleOnSelect(id, name)}>
                  <span>{name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
