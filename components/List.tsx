"use client";

import {
  addFriendToList,
  clearList,
  deleteAdditionalListItem,
  deleteListItem,
  insertNewAdditionalListItem,
  leaveList,
  setCheckedAdditionalListItem,
  setCheckedListItem,
} from "@/serverFunctions/list/serverFunctions";
import { CheckBoxWithText } from "./CheckBoxWithText";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LogOut, Plus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useResponseMiddleware } from "@/hooks/useResponseMiddleware";
import {
  AdditionalListIngredient,
  ListIngredient,
  ListsType,
} from "@/database.types";
import { useToast } from "./ui/use-toast";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Card } from "./ui/card";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

const List = ({
  data,
  friends,
}: {
  data: ListsType[];
  friends: { id: string; first_name: string; last_name: string }[];
}) => {
  const [focusedList, setFocusedList] = useState<ListsType>();
  const [ingredients, setIngredients] = useState<ListIngredient[]>([]);
  const [additionalIngredients, setAdditionalIngredients] = useState<
    AdditionalListIngredient[]
  >([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!focusedList) {
      focusPersonalList();
    } else {
      const alreadyFocusedList = data.find((el) => el.id === focusedList.id);
      setFocusedList(alreadyFocusedList);
    }
  }, [data]);

  function focusPersonalList() {
    const personal_list = data.find((el) => el.personal === true);
    setFocusedList(personal_list);
    if (personal_list?.ingredients?.[0].id) {
      setIngredients(personal_list?.ingredients || []);
    }
    setAdditionalIngredients(personal_list?.additional_ingredients || []);
  }

  function handleChangeSelectedList(newList: ListsType) {
    setFocusedList(newList);
    if (newList?.ingredients?.[0].id) {
      setIngredients(newList?.ingredients);
    } else {
      setIngredients([]);
    }
    setAdditionalIngredients(newList?.additional_ingredients || []);
  }

  async function handleFormSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (focusedList) {
      const { error, data } = await insertNewAdditionalListItem({
        list_id: focusedList?.id,
        name: newIngredient,
        checked: false,
      });
      const res = useResponseMiddleware({ error, data }, toast);
    }
  }

  async function handleDeleteItem(id: number) {
    if (focusedList) {
      const newItems = ingredients.filter((el) => el.id !== id);
      setIngredients(newItems);
      const { error } = await deleteListItem(focusedList.id, id);
      const res = useResponseMiddleware({ error }, toast);
    }
  }

  async function handleDeleteAdditionalItem(id: number) {
    if (focusedList) {
      const newItems = additionalIngredients.filter((el) => el.id !== id);
      setAdditionalIngredients(newItems);
      const { error } = await deleteAdditionalListItem(focusedList.id, id);
      const res = useResponseMiddleware({ error }, toast);
    }
  }

  return (
    <ResizablePanelGroup
      autoSaveId={"PanelSizes"}
      direction="horizontal"
      className="w-full h-[94vh] bg-background"
    >
      <ResizablePanel
        className="hidden md:flex"
        collapsible={true}
        minSize={5}
        defaultSize={25}
      >
        <div className="flex h-full w-full flex-col justify-start items-center gap-y-2">
          <div className="h-[6vh] border-b w-full flex justify-start items-center px-4 py-4">
            <b className="whitespace-nowrap overflow-hidden text-overflow-ellipsis">
              Liste personnelle
            </b>
          </div>
          <div className="flex w-full flex-col justify-start items-start px-2 py-1">
            {data
              .filter((el) => el.personal)
              ?.map((el) => {
                return (
                  <div
                    key={el.id}
                    className={`${focusedList?.id === el.id ? "bg-primary/50 hover:bg-primary/50" : "hover:bg-slate-100 dark:hover:bg-neutral-800"} w-full flex justify-start items-center rounded-md p-1 ps-2 transition-all cursor-pointer`}
                    onClick={() => handleChangeSelectedList(el)}
                  >
                    <h4 className="capitalize">{el.name}</h4>
                  </div>
                );
              })}
          </div>
          <div className="h-[6vh] border-b border-t w-full flex justify-between items-center px-4 py-4">
            <b className="whitespace-nowrap overflow-hidden text-overflow-ellipsis">
              Listes partagées
            </b>
            <div className="flex justify-end">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={"/protected/listCreation/"}>
                      <div className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800">
                        <Plus size={20} />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="bg-primary/50">
                    <p className="text-foreground">Ajouter une liste</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex w-full flex-col justify-start items-start px-2 py-1 gap-y-3 overflow-y-scroll h-[88vh] noscrollbar">
            {data
              .filter((el) => !el.personal)
              ?.map((el) => {
                return (
                  <div
                    key={el.id}
                    className={`${focusedList?.id === el.id ? "bg-primary/50 hover:bg-primary/50" : "hover:bg-slate-100 dark:hover:bg-neutral-800"} w-full flex justify-start items-center rounded-md p-1 ps-2 transition-all cursor-pointer`}
                    onClick={() => handleChangeSelectedList(el)}
                  >
                    <h4 className="capitalize">{el.name}</h4>
                  </div>
                );
              })}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={75} className="hidden md:flex">
        <div className="flex h-full w-full flex-col justify-start items-center">
          <div className="h-[6vh] border-b w-full flex justify-between items-center px-[7%]">
            {!focusedList?.personal && (
              <div className="flex-1 flex justify-end items-center gap-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Membres du groupe</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {focusedList?.users.map(({ id, name }) => {
                      return (
                        <DropdownMenuItem key={id}>{name}</DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                            !focusedList?.users
                              .map((item) => item.id)
                              .includes(el.id)
                        )
                        ?.map(({ id, first_name, last_name }) => {
                          return (
                            <CommandItem
                              key={id}
                              onSelect={async () => {
                                if (focusedList) {
                                  const { error } = await addFriendToList(
                                    focusedList.id,
                                    id
                                  );
                                  useResponseMiddleware({ error, data }, toast);
                                  setOpen(false);
                                }
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
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800"
                        onClick={() => setOpen(true)}
                      >
                        <UserPlus size={20} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-primary/50">
                      <p className="text-foreground">Ajouter un membre</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <LogOut size={20} />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Vous êtes sûrs ?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Vous ne pourrez plus accéder à cette liste
                                partagée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  if (focusedList) {
                                    const { error } = await leaveList(
                                      focusedList?.id
                                    );
                                    useResponseMiddleware({ error }, toast);
                                    focusPersonalList();
                                  }
                                }}
                              >
                                Confirmer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-destructive">
                      <p className="text-foreground">Quitter la liste</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
          <div className="flex w-full flex-col justify-center items-center px-[7%] py-[7%] gap-y-3 overflow-scroll h-[88vh] noscrollbar">
            <div className="w-full border h-full rounded-xl flex p-10 justify-start items-start overflow-y-auto">
              <div className="w-full flex flex-col justify-center items-start gap-y-4">
                {ingredients?.length > 0 &&
                  ingredients?.map(({ id, name, unit, checked, quantity }) => {
                    let newCount = Math.ceil((quantity || 0) * 10) / 10;
                    let displayText;

                    if (newCount === 0) {
                      displayText = `${name}`;
                    } else {
                      displayText =
                        unit && unit !== "/"
                          ? `${newCount} ${unit} ${name}`
                          : `${newCount} ${name}`;
                    }

                    return (
                      <CheckBoxWithText
                        key={id}
                        id={id}
                        defaultChecked={checked}
                        text={displayText}
                        onClick={setCheckedListItem}
                        onDelete={handleDeleteItem}
                        focusedListId={focusedList?.id}
                      />
                    );
                  })}
                {additionalIngredients?.length > 0 &&
                  additionalIngredients?.map(({ id, name, checked }) => {
                    return (
                      <CheckBoxWithText
                        key={id}
                        id={id}
                        defaultChecked={checked}
                        text={`${name}`}
                        onClick={setCheckedAdditionalListItem}
                        onDelete={handleDeleteAdditionalItem}
                        focusedListId={focusedList?.id}
                      />
                    );
                  })}
              </div>
            </div>
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                let newId = 1;
                if (additionalIngredients.length > 0) {
                  newId =
                    additionalIngredients[additionalIngredients.length - 1]
                      .id || 1;
                }
                const newAdditionalIngredients = [
                  ...additionalIngredients,
                  {
                    list_id: focusedList?.id || 1,
                    name: newIngredient,
                    checked: false,
                    id: newId + 1,
                  },
                ];
                setAdditionalIngredients(newAdditionalIngredients);
                setNewIngredient("");
                handleFormSubmit(ev);
              }}
              className="w-full flex gap-x-2"
            >
              <Input
                value={newIngredient}
                onChange={(ev) => setNewIngredient(ev.target.value)}
                type="text"
                placeholder="Ajoute un ingrédient"
              />
              <Button
                className="bg-primary/50 hover:bg-primary/50"
                type="submit"
              >
                <Plus />
              </Button>
              <Button
                type="button"
                variant={"outline"}
                className="hover:bg-destructive/90 hover:text-foreground"
                onClick={async () => {
                  if (focusedList) {
                    setIngredients([]);
                    setAdditionalIngredients([]);
                    const { error } = await clearList(focusedList?.id);
                    useResponseMiddleware({ error }, toast);
                  }
                }}
              >
                Effacer la Liste
              </Button>
            </form>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default List;
