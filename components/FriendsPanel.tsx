"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { Check, Import, Minus, Plus, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { FormattedRecipe, RecipesGroupedByUser } from "@/database.types";
import { FormEvent, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import DetailedRecipe from "./DetailedRecipe";
import {
  acceptFriend,
  deleteFriend,
  importRecipe,
  refuseFriend,
} from "@/serverFunctions/friends/serverFunctions";
import { toast, useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { SearchNewFriend } from "./SearchNewFriend";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useResponseMiddleware } from "@/hooks/useResponseMiddleware";
import Image from "next/image";

const FriendsPanel = ({ data }: { data: RecipesGroupedByUser }) => {
  const [focusedFriend, setFocusedFriend] = useState<string | null>(null);
  const [focusedRecipe, setFocusedRecipe] = useState<
    FormattedRecipe | undefined
  >();
  const [peopleCount, setPeopleCount] = useState(1);
  const { toast } = useToast();

  async function handleImport(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (focusedRecipe) {
      const { name, counter, ingredients, steps, image_path, image_url } =
        focusedRecipe;
      const count = counter;
      const { error } = await importRecipe(
        name,
        count,
        ingredients,
        steps,
        image_path,
        image_url
      );
      const res = useResponseMiddleware({ error }, toast);
      if (res) {
        toast({
          title: "Parfait !",
          description: "La recette a été importée dans vos recettes !",
          duration: 2500,
        });
      }
    }
  }

  async function handleAddFriend(sender_id: string) {
    const { error } = await acceptFriend(sender_id);
    useResponseMiddleware({ error }, toast);
  }

  async function handleRefuseFriend(sender_id: string) {
    const { error } = await refuseFriend(sender_id);
    useResponseMiddleware({ error }, toast);
  }

  async function handleDeleteFriend(sender_id: string) {
    const { error } = await deleteFriend(sender_id);
    useResponseMiddleware({ error }, toast);
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
        <div className="flex h-full w-full flex-col justify-start items-center">
          <div className="h-[6vh] border-b w-full flex justify-between items-center px-4">
            <b>Amis</b>
            <div>
              <SearchNewFriend />
            </div>
          </div>
          <div className="flex w-full flex-col justify-start items-start py-4 gap-y-3 overflow-scroll h-[88vh] noscrollbar">
            {data &&
              //@ts-ignore
              Object.values(data.askingFriends).map((el) => {
                return (
                  <div className=" w-full flex justify-between items-center rounded-md gap-x-2 px-4 transition-all">
                    <span className="whitespace-nowrap overflow-hidden text-overflow-ellipsis">
                      {el.first_name} {el.last_name}
                    </span>
                    <div className="flex justify-center items-center gap-x-2">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="h-[75%]"
                              variant="outline"
                              onClick={() => handleAddFriend(el.id)}
                            >
                              <Check size={15} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-primary/50">
                            <p className="text-foreground">Confirmer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="h-[75%]"
                              variant="outline"
                              onClick={() => handleRefuseFriend(el.id)}
                            >
                              <X size={15} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-destructive/50">
                            <p className="text-foreground">Refuser</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                );
              })}
            {data &&
              //@ts-ignore
              Object.values(data.recipeData).map((el) => {
                return (
                  <Dialog key={el.user_id}>
                    <ContextMenu>
                      <ContextMenuTrigger className="w-full">
                        <div
                          className={`${focusedFriend === el.user_id ? "bg-primary/50 hover:bg-primary/50" : "hover:bg-slate-100 dark:hover:bg-neutral-800"} w-full flex justify-start items-center rounded-md gap-x-2 ps-2 transition-all cursor-pointer`}
                          onClick={() => {
                            setFocusedFriend(el.user_id);
                          }}
                        >
                          <Avatar className="scale-75">
                            <AvatarFallback>
                              {el.user_first_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          {el.user_first_name} {el.user_last_name}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <DialogTrigger asChild>
                          <ContextMenuItem>Supprimer</ContextMenuItem>
                        </DialogTrigger>
                      </ContextMenuContent>
                    </ContextMenu>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="mb-4">
                          Vous êtes sûrs ?
                        </DialogTitle>
                        <DialogDescription>
                          {el.user_first_name} {el.user_last_name} ne sera plus
                          votre ami et vous ne pourrez plus accéder à ses
                          recettes
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose className="flex gap-x-2">
                          <Button variant="outline">Annuler</Button>
                          <Button
                            className="bg-primary/50"
                            onClick={async () => handleDeleteFriend(el.user_id)}
                          >
                            Confirmer
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                );
              })}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={75}>
        <div className="flex h-full w-full flex-col justify-start items-center">
          <div className="h-[6vh] border-b w-full flex justify-between items-center px-4">
            <b>Recettes</b>
          </div>
          <div className="flex w-full flex-col justify-start items-center p-2 gap-y-2 overflow-scroll h-[88vh] noscrollbar">
            {data &&
              focusedFriend &&
              data?.recipeData?.[focusedFriend]?.recipes?.map((recipe) => {
                return (
                  <Card
                    key={recipe.id}
                    className={`${focusedRecipe?.id === recipe.id && "bg-primary/50 bg-opacity-10"} cursor-pointer w-full h-[100px] min-h-[100px] max-h-[100px] overflow-hidden`}
                    onClick={() => setFocusedRecipe(recipe)}
                  >
                    <CardHeader className="flex flex-row p-1 h-[100px] space-y-0">
                      {recipe.image_url && (
                        <Image
                          className="rounded-xl"
                          src={recipe.image_url}
                          alt={recipe.name}
                          width={100}
                          height={100}
                        />
                      )}
                      <div className="flex flex-col space-y-1.5 h-[100px] pt-[20px] ps-4">
                        <CardTitle className="text-[14px] whitespace-nowrap overflow-hidden text-overflow-ellipsis">
                          {recipe.name}
                        </CardTitle>
                        <CardDescription className="text-[12px] whitespace-nowrap overflow-hidden text-overflow-ellipsis">
                          {recipe?.ingredients
                            .slice(0, -1)
                            .map(({ name }) => `${name}, `)}{" "}
                          {
                            recipe?.ingredients[recipe?.ingredients.length - 1]
                              ?.name
                          }
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={75} className="hidden md:flex">
        <div className="flex h-full w-full flex-col justify-start items-center">
          <div className="h-[6vh] border-b w-full flex items-center px-6 gap-x-4">
            <div className="flex-1 flex justify-start"></div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center justify-center space-x-2 scale-90">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                  onClick={() => {
                    if (peopleCount > 1) {
                      setPeopleCount((prev) => prev - 1);
                    }
                  }}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold tracking-tighter">
                    {peopleCount}
                  </div>
                  <div className="text-[0.70rem] uppercase text-muted-foreground">
                    Personne(s)
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                  onClick={() => setPeopleCount((prev) => prev + 1)}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 flex justify-end items-center gap-x-4">
              {focusedRecipe && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <form onSubmit={handleImport}>
                        <button
                          type="submit"
                          className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800"
                        >
                          <Import size={20} />
                        </button>
                      </form>
                    </TooltipTrigger>
                    <TooltipContent className="bg-primary/50">
                      <p className="text-foreground">Importer la recette</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col justify-start items-center py-6 px-[15%] overflow-scroll h-[88vh] noscrollbar">
            <DetailedRecipe recipe={focusedRecipe} chosenCount={peopleCount} />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default FriendsPanel;
