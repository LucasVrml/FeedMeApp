"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import {
  addNewFriend,
  fetchNewFriends,
} from "@/serverFunctions/friends/serverFunctions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Plus } from "lucide-react";
import { toast, useToast } from "./ui/use-toast";
import { useResponseMiddleware } from "@/hooks/useResponseMiddleware";

export function SearchNewFriend() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [friends, setFriends] = useState<
    { id: string; full_name: string; username: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  function handleValueChange(search: string) {
    setValue(search);
    setLoading(true);
  }

  async function handleOnSelect(id: string) {
    const { error } = await addNewFriend(id);
    const res = useResponseMiddleware({ error }, toast);
    setValue("");
    setOpen(false);
    if (res) {
      toast({
        title: "Parfait !",
        description: "La demande d'ami a été envoyée !",
        duration: 2500,
      });
    }
  }

  useEffect(() => {
    const fetchValues = async (value: string) => {
      const { error, data } = await fetchNewFriends(value);
      const res = useResponseMiddleware({ error, data }, toast);
      if (res) {
        setFriends(res);
      }
      setLoading(false);
    };
    fetchValues(value);
  }, [value, open]);

  return (
    <div className="w-full flex justify-center">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800"
              onClick={() => setOpen(true)}
            >
              <Plus size={20} />
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-primary/50">
            <p className="text-foreground">Ajouter une ami</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Rechercher une personne ..."
          value={value}
          onValueChange={handleValueChange}
        />
        <CommandList>
          <CommandEmpty>Pas de résultats</CommandEmpty>
          <CommandGroup>
            {friends?.map(({ id, full_name, username }) => {
              return (
                <CommandItem key={id} onSelect={async () => handleOnSelect(id)}>
                  <span>
                    {full_name}{" "}
                    <span className="text-foreground/60">#{username}</span>
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
