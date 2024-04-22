"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useToast } from "./ui/use-toast";

export function CheckBoxWithText({
  id,
  text,
  onClick,
  defaultChecked,
  onDelete,
  focusedListId,
}: {
  id?: number;
  text: string;
  onClick?: Function;
  defaultChecked?: boolean;
  onDelete?: Function;
  focusedListId?: number;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  async function handleClick() {
    const newChecked = !checked;
    setChecked((prev) => !prev);
    if (onClick) {
      await onClick(focusedListId, id, newChecked);
    }
  }

  return (
    <div className="flex space-x-4 justify-center items-center">
      <Checkbox
        id={`${id || ""}${text}`}
        checked={checked}
        onCheckedChange={handleClick}
      />
      <label
        htmlFor={`${id || ""}${text}`}
        className={`${checked ? "line-through text-muted-foreground/30" : "text-foreground"} leading-none first-letter:capitalize`}
      >
        {text}
      </label>
      {typeof onDelete === "function" && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger
              asChild
              onClick={async () => {
                await onDelete(id);
              }}
            >
              <div className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800">
                <X size={15} />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-primary/50">
              <p className="text-foreground">Effacer cet item</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
