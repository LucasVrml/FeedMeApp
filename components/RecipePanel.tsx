"use client";

import { Category, FormattedRecipe } from "@/database.types";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { FormEvent, useEffect, useRef, useState } from "react";
import DetailedRecipe from "./DetailedRecipe";
import {
  Camera,
  Expand,
  Minus,
  Pen,
  Plus,
  ShoppingCart,
  Trash,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  addRecipeImage,
  addToList,
  createCategory,
  deleteCategory,
  deleteRecipe,
} from "@/serverFunctions/recipe/serverFunctions";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useResponseMiddleware } from "@/hooks/useResponseMiddleware";
import { useRouter } from "next/navigation";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { v4 as uuidv4 } from "uuid";
import { fileToBase64 } from "./CreationForm";
import Image from "next/image";

const RecipePanel = ({
  recipesData,
  categories,
  onlyRecipe = false,
  listIds,
}: {
  recipesData: FormattedRecipe[];
  categories?: Category[];
  onlyRecipe?: boolean;
  listIds: { list: { id: number; personal: boolean; name: string } }[];
}) => {
  const [focusedRecipe, setFocusedRecipe] = useState<
    FormattedRecipe | undefined
  >(recipesData?.[0]);
  const [peopleCount, setPeopleCount] = useState(1);
  const [categoriesState, setCategoriesState] = useState(categories);
  const [focusedCategory, setFocusedCategory] = useState(0);
  const [filteredData, setFilteredData] = useState(recipesData);
  const [newCategoryInputVisible, setNewCategoryInputVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const InputRef = useOutsideClick(async () => {
    if (newCategory) {
      if (categoriesState && categoriesState.length > 0) {
        const newCategoriesState = [
          ...categoriesState,
          {
            id: categoriesState[categoriesState.length - 1].id + 1,
            name: newCategory,
          },
        ];
        setCategoriesState(newCategoriesState);
      } else {
        const newCategoriesState = [
          {
            id: 1,
            name: newCategory,
          },
        ];
        setCategoriesState(newCategoriesState);
      }
      setNewCategory("");
      setNewCategoryInputVisible(false);
      const { error } = await createCategory(newCategory);
      useResponseMiddleware({ error }, toast);
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    setFilteredData(recipesData);
    const newFocus =
      recipesData?.find((el) => el.id === focusedRecipe?.id) || focusedRecipe;
    setFocusedRecipe(newFocus);
  }, [recipesData]);

  async function handleNewCategorySubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const { error } = await createCategory(newCategory);
    const res = useResponseMiddleware({ error }, toast);
  }

  function filterRecipes(newCategory: number) {
    if (!newCategory) {
      setFilteredData(recipesData);
    } else {
      const res = recipesData.filter((el) => {
        return el.category?.map((cat) => cat.id).includes(newCategory);
      });
      setFilteredData(res);
    }
  }

  async function handleDelete() {
    if (focusedRecipe) {
      const newFilteredData = filteredData.filter(
        (el) => el.id !== focusedRecipe.id
      );
      if (filteredData?.length > 1) {
        setFocusedRecipe(filteredData[0]);
      } else {
        setFocusedRecipe(undefined);
      }
      setFilteredData(newFilteredData);
      const { error } = await deleteRecipe(
        Number(focusedRecipe?.id),
        focusedRecipe?.image_path
      );
      const res = useResponseMiddleware({ error }, toast);
    }
  }

  async function handleDeleteCategory(category_id: number) {
    const { error } = await deleteCategory(category_id);
    useResponseMiddleware({ error }, toast);
  }

  async function handleAddToList(listId: number) {
    const formattedIngredients = focusedRecipe?.ingredients?.map(
      ({ id, quantity, unit }) => {
        let formattedQuantities = null;
        if (quantity) {
          formattedQuantities =
            Math.round(quantity * (peopleCount / focusedRecipe.counter) * 100) /
            100;
        }
        return {
          id,
          quantity: formattedQuantities,
          unit,
        };
      }
    );
    const { error } = await addToList(formattedIngredients, listId);
    const res = useResponseMiddleware({ error }, toast);
    if (res) {
      toast({
        title: "Parfait !",
        description: "Les ingrédients on été ajoutés à la liste !",
        duration: 2500,
      });
    }
  }

  function handleNewCategoryVisible() {
    if (newCategoryInputVisible && InputRef.current) {
      InputRef.current.focus();
    }
    setNewCategoryInputVisible(true);
  }

  const handlePhotoInputClick = () => {
    if (photoInputRef?.current) {
      photoInputRef.current.click();
    }
  };

  const handleFileChange = (ev: React.FormEvent<HTMLInputElement>): void => {
    ev.preventDefault();
    if (ev.currentTarget.files && ev.currentTarget.files.length > 0) {
      handleImportPhoto(ev.currentTarget.files[0]);
    }
  };

  const handleImportPhoto = async (file: File) => {
    if (file && focusedRecipe) {
      const uniqueFileName = `${uuidv4()}-${file.name}`;
      const filePath = `${uniqueFileName}`;
      const fileParsed = await fileToBase64(file);
      const { error, data } = await addRecipeImage(
        filePath,
        fileParsed,
        focusedRecipe.id,
        focusedRecipe.image_path
      );
      useResponseMiddleware({ error, data }, toast);
    }
  };

  useEffect(() => {
    filterRecipes(focusedCategory);
  }, [recipesData]);

  useEffect(() => {
    if (newCategoryInputVisible && InputRef.current) {
      InputRef.current.focus();
    }
  }, [newCategoryInputVisible]);

  return (
    <ResizablePanelGroup
      autoSaveId={"FriendsPanelSizes"}
      direction="horizontal"
      className="w-full h-[94vh] bg-background"
    >
      {!onlyRecipe && (
        <ResizablePanel
          className="hidden md:flex"
          collapsible={true}
          minSize={5}
          defaultSize={25}
        >
          <div className="flex h-full w-full flex-col justify-start items-center">
            <div className="h-[6vh] border-b w-full flex justify-between items-center px-4">
              <b>Catégories</b>
              <div>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={handleNewCategoryVisible}
                        className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800"
                      >
                        <Plus size={20} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-primary/50">
                      <p className="text-foreground">Ajouter une catégorie</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex w-full flex-col justify-start items-start px-2 py-3 gap-y-3 overflow-y-scroll h-[88vh] noscrollbar">
              <div
                className={`${!focusedCategory ? "bg-primary/50 hover:bg-primary/50" : "hover:bg-slate-100 dark:hover:bg-neutral-800"} w-full flex justify-start items-center rounded-md p-1 ps-2 transition-all cursor-pointer`}
                onClick={() => {
                  setFocusedCategory(0);
                  filterRecipes(0);
                }}
              >
                <h4>Tout</h4>
              </div>
              {categoriesState?.map((el) => {
                return (
                  <Dialog key={el.id}>
                    <ContextMenu>
                      <ContextMenuTrigger className="w-full">
                        <div
                          className={`${focusedCategory === el.id ? "bg-primary/50 hover:bg-primary/50" : "hover:bg-slate-100 dark:hover:bg-neutral-800"} w-full flex justify-start items-center rounded-md p-1 ps-2 transition-all cursor-pointer`}
                          onClick={() => {
                            setFocusedCategory(el.id);
                            filterRecipes(el.id);
                          }}
                        >
                          <h4 className="capitalize">{el.name}</h4>
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
                          Cette catégorie sera définitivement supprimée.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose className="flex gap-x-2">
                          <Button variant="outline">Annuler</Button>
                          <Button
                            className="bg-primary/50"
                            onClick={async () => {
                              const newCategoriesState = categoriesState.filter(
                                (item) => el.id !== item.id
                              );
                              setCategoriesState(newCategoriesState);
                              handleDeleteCategory(el.id);
                            }}
                          >
                            Confirmer
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                );
              })}
              {newCategoryInputVisible && (
                <form
                  className="w-full"
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    if (categoriesState && categoriesState.length > 0) {
                      const newCategoriesState = [
                        ...categoriesState,
                        {
                          id:
                            categoriesState[categoriesState.length - 1].id + 1,
                          name: newCategory,
                        },
                      ];
                      setCategoriesState(newCategoriesState);
                    } else {
                      const newCategoriesState = [
                        {
                          id: 1,
                          name: newCategory,
                        },
                      ];
                      setCategoriesState(newCategoriesState);
                    }
                    handleNewCategorySubmit(ev);
                    setNewCategory("");
                    setNewCategoryInputVisible(false);
                  }}
                >
                  <Input
                    className="w-full capitalize"
                    ref={InputRef}
                    disabled={!newCategoryInputVisible}
                    type="text"
                    value={newCategory}
                    onChange={(ev) => setNewCategory(ev.target.value)}
                  />
                </form>
              )}
            </div>
          </div>
        </ResizablePanel>
      )}
      {!onlyRecipe && <ResizableHandle className="hidden md:flex" />}
      {!onlyRecipe && (
        <ResizablePanel defaultSize={75}>
          <div className="flex h-full w-full flex-col justify-start items-center">
            <div className="h-[6vh] border-b w-full flex justify-between items-center px-4">
              <b>Recettes</b>
              <div>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={"/protected/creation"}>
                        <div className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800">
                          <Plus size={20} />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="bg-primary/50">
                      <p className="text-foreground">Ajouter une recette</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex w-full flex-col justify-start items-center p-2 py-3 gap-y-2 overflow-scroll h-[88vh] noscrollbar">
              {filteredData?.map((recipe) => {
                return (
                  <Card
                    key={recipe.id}
                    className={`${focusedRecipe?.id === recipe.id && "bg-primary/50 bg-opacity-10"} cursor-pointer w-full h-[100px] min-h-[100px] max-h-[100px] overflow-hidden p-0`}
                    onClick={() => setFocusedRecipe(recipe)}
                  >
                    <CardHeader className="flex flex-row p-2 h-[100px] space-y-0">
                      {recipe.image_url && (
                        <Image
                          className="rounded-xl"
                          src={recipe.image_url}
                          alt={recipe.name}
                          width={100}
                          height={100}
                        />
                      )}
                      <div className="flex flex-col gap-y-1 h-[100px] pt-[20px] ps-4">
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
      )}
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
            {focusedRecipe ? (
              <div className="flex-1 flex justify-end items-center gap-x-4">
                {!onlyRecipe && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/protected/detailedRecipe/${focusedRecipe?.id}`}
                          passHref
                        >
                          <div className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800">
                            <Expand size={20} />
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent className="bg-primary/50">
                        <p className="text-foreground">Grand écran</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/protected/modification/${focusedRecipe?.id}`}
                      >
                        <div className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800">
                          <Pen size={20} />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="bg-primary/50">
                      <p className="text-foreground">Modifier la recette</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div>
                  <Input
                    className="hidden"
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/heic"
                    onChange={handleFileChange}
                  />
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800"
                          onClick={handlePhotoInputClick}
                        >
                          <Camera size={20} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-primary/50">
                        <p className="text-foreground">Ajouter une photo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div>
                              <ShoppingCart size={20} />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>
                              Ajouter à quelle liste ?
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {listIds.map((el) => (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                key={el.list.id}
                                onClick={async () =>
                                  await handleAddToList(el.list.id)
                                }
                              >
                                {el.list.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-primary/50">
                      <p className="text-foreground">
                        Ajouter à la liste de course
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Trash size={20} className="text-destructive" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Vous êtes sûrs ?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette recette sera définitivement supprimée
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  await handleDelete();
                                  router.replace("/protected/recipes");
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
                      <p className="text-foreground">Supprimer la recette</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              <div className="flex-1 flex" />
            )}
          </div>
          <div className="flex w-full flex-col justify-start items-center py-6 px-[15%] overflow-scroll h-[88vh] noscrollbar">
            <DetailedRecipe
              recipe={focusedRecipe}
              chosenCount={peopleCount}
              categories={categories}
            />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default RecipePanel;
