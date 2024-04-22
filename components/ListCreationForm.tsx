"use client";

import { FormEvent, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { createList } from "@/serverFunctions/list/serverFunctions";
import { useResponseMiddleware } from "@/hooks/useResponseMiddleware";
import { useToast } from "./ui/use-toast";

const ListCreationForm = ({
  friends,
  inModal,
}: {
  friends: { id: string; first_name: string; last_name: string }[];
  inModal: boolean;
}) => {
  const [name, setName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<
    { id: string; first_name: string; last_name: string }[]
  >([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleValidation(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const { error } = await createList(
      name,
      selectedFriends.map((el) => el.id)
    );
    const res = useResponseMiddleware({ error }, toast);
    if (res) {
      router.back();
    }
  }

  return (
    <div className="flex w-full h-full justify-evenly">
      <div className="w-full max-w-[800px] mt-4 flex flex-col justify-start items-center pe-3 gap-y-4 overflow-y-scroll noscrollbar pb-10">
        <div className="grid grid-cols-6 gap-6 w-full items-center content-start pt-2">
          <Label
            className="whitespace-nowrap col-span-6 md:col-span-2 text-left font-bold text-md"
            htmlFor="name"
          >
            Nom de la liste de course
          </Label>
          <Input
            className="col-span-6 md:col-span-4"
            id="name"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
        </div>
        <div className="grid grid-cols-6 gap-6 w-full items-start content-start">
          <Label className="whitespace-nowrap translate-y-2 text-left col-span-6 md:col-span-2 font-bold text-md me-10">
            Membres
          </Label>
          <div
            className={`flex flex-col w-full gap-y-4 col-span-6 md:col-span-4`}
          >
            {selectedFriends?.map((el) => {
              return (
                <div className="grid grid-cols-8 gap-x-2 w-full items-center content-center">
                  <Card className="col-span-7 text-center capitalize bg-primary/50 h-full flex justify-center items-center">
                    {el.first_name} {el.last_name}
                  </Card>
                  <div className="flex justify-end items-center col-span-1">
                    <div
                      className="flex justify-center items-center cursor-pointer transition-all p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800"
                      onClick={() => {
                        const newSelectedFriends = selectedFriends.filter(
                          (item) => el.id !== item.id
                        );
                        setSelectedFriends(newSelectedFriends);
                      }}
                    >
                      <Trash size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
            <Button variant="outline" onClick={() => setOpen(true)}>
              Ajouter un membre à la liste
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
              <CommandInput
                placeholder="Rechercher une personne ..."
                value={""}
                onValueChange={() => {}}
              />
              <CommandList>
                <CommandEmpty>Pas de résultats</CommandEmpty>
                <CommandGroup>
                  {friends
                    ?.filter(
                      (el) =>
                        !selectedFriends.map((item) => item.id).includes(el.id)
                    )
                    ?.map(({ id, first_name, last_name }) => {
                      return (
                        <CommandItem
                          key={id}
                          onSelect={async () => {
                            setSelectedFriends((prev) => [
                              ...prev,
                              { id, first_name, last_name },
                            ]);
                          }}
                        >
                          <span>
                            {first_name} {last_name}
                          </span>
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </div>
        </div>
        {!inModal && (
          <div className="mt-10 flex justify-center items-center gap-2">
            <form onSubmit={handleValidation}>
              <Button disabled={!name} type="submit" variant={"outline"}>
                Valider
              </Button>
            </form>
            <Button
              className="hover:bg-destructive/90 hover:text-foreground"
              variant={"outline"}
              onClick={() => router.back()}
            >
              Annuler
            </Button>
          </div>
        )}
        {inModal && (
          <div className="absolute top-2 right-2 flex justify-center items-center gap-2">
            <form onSubmit={handleValidation}>
              <Button disabled={!name} type="submit" variant={"outline"}>
                Valider
              </Button>
            </form>
            <Button
              className="hover:bg-destructive/90 hover:text-foreground"
              variant={"outline"}
              onClick={() => router.back()}
            >
              Annuler
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListCreationForm;
