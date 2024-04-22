"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Brain, Camera, Globe, Minus, Plus, X } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { Textarea } from "./ui/textarea";
import StepItem from "./StepItem";
import IngredientItem from "./IngredientItem";
import { useRouter } from "next/navigation";
import { IngredientDetail } from "@/database.types";
import {
  createRecipe,
  handleFileSubmit,
  scrapUrl,
  updateRecipe,
  updateRecipeWithDeleteImage,
  updateRecipeWithImage,
} from "@/serverFunctions/recipe/serverFunctions";
import { Badge } from "./ui/badge";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
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
import { useResponseMiddleware } from "@/hooks/useResponseMiddleware";
import { useToast } from "./ui/use-toast";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]); // Remove 'data:image/jpeg;base64,' part
    };
    reader.readAsDataURL(file);
  });
};

const CreationForm = ({
  userInfos,
  id,
  inModal = false,
  isCreation = false,
  defaultName,
  defaultCount,
  defaultImage,
  defaultImagePath,
  defaultIngredients,
  defaultSteps,
  defaultCategories,
}: {
  userInfos?: any;
  id?: number;
  inModal?: boolean;
  isCreation?: boolean;
  defaultName?: string;
  defaultCount?: number;
  defaultImage?: string;
  defaultImagePath?: string;
  defaultIngredients?: IngredientDetail[];
  defaultSteps?: string[];
  defaultCategories?: {
    id: number;
    name: string;
    active?: boolean;
  }[];
}) => {
  const [name, setName] = useState(defaultName || "");
  const [count, setCount] = useState(defaultCount || 1);
  const [image, setImage] = useState(defaultImage || "");
  const [newImage, setNewImage] = useState("");
  const [newImagePath, setNewImagePath] = useState("");
  const [ingredients, setIngredients] = useState(defaultIngredients || []);
  const [steps, setSteps] = useState<string[]>(defaultSteps || []);
  const [newStep, SetNewStep] = useState("");
  const [categories, setCategories] = useState(defaultCategories || []);
  const InputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isAnalysingWebsite, setIsAnalysingWebsite] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  function isDateBeforeToday(dateString: string) {
    if (!dateString) {
      return true;
    }
    const dateParts = dateString.split("-");
    //@ts-ignore
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  function addStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newStep) {
      setSteps((oldSteps: string[]) => [...oldSteps, newStep]);
      SetNewStep("");
      resetTextareaHeight();
    }
  }

  function adjustHeight(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    ev.target.style.height = "inherit";
    ev.target.style.height = `${ev.target.scrollHeight}px`;
  }

  function resetTextareaHeight() {
    if (textareaRef.current) {
      textareaRef.current.style.height = "initial";
    }
  }

  function handleCategoryClick(id: number, active?: boolean) {
    const newCategories = categories.map((el) => {
      if (el.id === id) {
        return {
          id,
          name: el.name,
          active: !el.active,
        };
      }
      return el;
    });
    setCategories(newCategories);
  }

  async function handleValidation(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setIsValidating(true);
    setLoading(true);
    if (isCreation) {
      const { error } = await createRecipe(
        name,
        count,
        ingredients,
        steps,
        categories,
        newImage,
        newImagePath
      );
      const res = useResponseMiddleware({ error }, toast);
      if (res) {
        router.back();
        return;
      }
    } else if (id) {
      if (newImage && newImagePath) {
        const { error } = await updateRecipeWithImage(
          id,
          name,
          newImage,
          newImagePath,
          count,
          ingredients,
          steps,
          categories,
          defaultImagePath
        );
        const res = useResponseMiddleware({ error }, toast);
        if (res) {
          router.back();
          return;
        }
      } else if (!image && !newImagePath && defaultImage) {
        const { error } = await updateRecipeWithDeleteImage(
          id,
          name,
          count,
          ingredients,
          steps,
          categories,
          defaultImagePath
        );
        const res = useResponseMiddleware({ error }, toast);
        if (res) {
          router.back();
          return;
        }
      } else {
        const { error } = await updateRecipe(
          id,
          name,
          count,
          ingredients,
          steps,
          categories
        );
        const res = useResponseMiddleware({ error }, toast);
        if (res) {
          router.back();
          return;
        }
      }
    }
    setIsValidating(false);
    setLoading(false);
  }

  const handleButtonClick = () => {
    if (InputRef?.current) {
      InputRef.current.click();
    }
  };

  const handleFileChange = (ev: React.FormEvent<HTMLInputElement>): void => {
    ev.preventDefault();
    if (ev.currentTarget.files && ev.currentTarget.files.length > 0) {
      handleImportPhoto(ev.currentTarget.files[0]);
    }
  };

  const handleImportPhoto = async (file: File) => {
    if (file) {
      setLoading(true);
      const fileParsed = await fileToBase64(file);
      const { error, data } = await handleFileSubmit(fileParsed);
      const res = useResponseMiddleware({ error, data }, toast);
      setLoading(false);
      if (res) {
        setName(res.name);
        setCount(res.count);
        setIngredients(res.ingredients);
        setSteps(res.steps);
      }
    }
  };

  const handleImageChange = (ev: React.FormEvent<HTMLInputElement>): void => {
    ev.preventDefault();
    if (ev.currentTarget.files && ev.currentTarget.files.length > 0) {
      handleImportImage(ev.currentTarget.files[0]);
    }
  };

  const handleImportImage = async (file: File) => {
    if (file) {
      const uniqueFileName = `${uuidv4()}-${file.name}`;
      const filePath = `${uniqueFileName}`;
      const fileParsed = await fileToBase64(file);
      setNewImage(fileParsed);
      setNewImagePath(filePath);
    }
  };

  const handleWebsiteImport = async () => {
    if (websiteUrl) {
      setIsAnalysingWebsite(true);
      setLoading(true);
      const { error, data } = await scrapUrl(websiteUrl);
      const res = useResponseMiddleware({ error, data }, toast);
      setLoading(false);
      setIsAnalysingWebsite(false);
      if (res) {
        setName(res.name);
        setCount(res.count);
        setIngredients(res.ingredients);
        setSteps(res.steps);
      }
    }
  };

  return (
    <div className="flex w-full h-[80vh] justify-evenly">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full z-50 bg-muted/80 flex flex-col gap-y-4 justify-center items-center">
          <LoadingSpinner />
          {!isValidating && (
            <>
              {isAnalysingWebsite ? (
                <span>L'url est entrain d'être analysée ...</span>
              ) : (
                <span>Votre photo est entrain d'être analysée ...</span>
              )}
            </>
          )}
        </div>
      )}
      <div className="w-full max-w-[800px] mt-4 flex flex-col justify-start items-center pe-3 gap-y-4 overflow-y-scroll noscrollbar pb-10">
        <div className="grid grid-cols-4 gap-6 w-full items-center content-start pt-2">
          <Label
            className="whitespace-nowrap col-span-4 md:col-span-1 text-left font-bold text-md"
            htmlFor="name"
          >
            Nom de la recette
          </Label>
          <Input
            className="col-span-4 md:col-span-3"
            id="name"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
        </div>
        <div className="grid grid-cols-4 gap-6 w-full items-center content-start pt-2">
          <Label
            className="whitespace-nowrap col-span-4 md:col-span-1 text-left font-bold text-md"
            htmlFor="name"
          >
            Image
          </Label>
          {image ? (
            <div className="relative">
              <Image
                className="rounded-xl"
                src={image}
                alt="Photo de la recette"
                width={800}
                height={800}
              />
              <Button
                variant="outline"
                className="absolute -top-2 -right-2 rounded-full w-6 h-6 flex justify-center items-center p-0"
                onClick={() => setImage("")}
              >
                <X />
              </Button>
            </div>
          ) : (
            <Input
              className="col-span-4 md:col-span-3"
              type="file"
              accept="image/jpeg, image/jpg, image/png, image/heic"
              onChange={(ev) => handleImageChange(ev)}
            />
          )}
        </div>
        <div className="grid grid-cols-4 gap-6 w-full items-center content-start pt-2">
          <Label className="whitespace-nowrap col-span-4 md:col-span-1 text-left font-bold text-md">
            Catégorie(s)
          </Label>
          <div className="flex flex-wrap w-full justify-center items-center col-span-4 md:col-span-3 gap-1">
            {categories?.map(({ id, name, active }) => {
              return (
                <Badge
                  onClick={() => handleCategoryClick(id, active)}
                  key={id}
                  variant={`${active ? "default" : "outline"}`}
                >
                  {name}
                </Badge>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6 w-full items-center content-start">
          <Label
            className="whitespace-nowrap col-span-4 md:col-span-1 text-left font-bold text-md"
            htmlFor="count"
          >
            Nombre de personnes
          </Label>
          <div
            id="count"
            className="flex items-center justify-center space-x-2 scale-90 col-span-4 md:col-span-3"
          >
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full"
              onClick={() => {
                if (count > 1) {
                  setCount((prev) => prev - 1);
                }
              }}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Decrease</span>
            </Button>
            <div className="text-center">
              <div className="text-xl font-bold tracking-tighter">{count}</div>
              <div className="text-[0.70rem] uppercase text-muted-foreground">
                Personne(s)
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full"
              onClick={() => setCount((prev) => prev + 1)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Increase</span>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6 w-full items-start content-start">
          <Label className="whitespace-nowrap translate-y-2 text-left col-span-4 md:col-span-1 font-bold text-md">
            Ingrédients
          </Label>
          <div
            className={`flex flex-col w-full gap-y-4 col-span-4 md:col-span-3`}
          >
            {ingredients?.map((el) => {
              return (
                <IngredientItem
                  key={el.id}
                  ingredient={el}
                  ingredients={ingredients}
                  setIngredients={setIngredients}
                />
              );
            })}
            <SearchInput
              ingredients={ingredients}
              setIngredients={setIngredients}
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6 w-full items-start content-start">
          <Label className="whitespace-nowrap translate-y-2 text-left col-span-4 md:col-span-1 capitalize font-bold text-md">
            étapes
          </Label>
          <div className={`w-full gap-y-3 col-span-4 md:col-span-3`}>
            <ol className="list-decimal break-words justify-start w-[100%]">
              {steps?.map((el, index) => {
                return (
                  <StepItem
                    key={index}
                    step={el}
                    steps={steps}
                    setSteps={setSteps}
                    index={index}
                  />
                );
              })}
            </ol>
            <form
              id="1"
              onSubmit={addStep}
              className="flex flex-start gap-x-2 items-start mt-4 w-full"
            >
              <Textarea
                ref={textareaRef}
                className="text-center outline-none focus:placeholder-transparent w-full resize-none"
                placeholder="Ajouter une étape"
                value={newStep}
                onChange={(ev) => SetNewStep(ev.target.value)}
                onInput={(ev: React.ChangeEvent<HTMLTextAreaElement>) =>
                  adjustHeight(ev)
                }
              />
              <Button variant={"outline"} form="1" type="submit">
                Ajouter
              </Button>
            </form>
          </div>
        </div>
        <div
          className={`${inModal ? "absolute top-2 right-2 flex justify-center items-center gap-2" : "mt-10 flex justify-center items-center gap-2"}`}
        >
          {isCreation && (
            <>
              <Dialog>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="gap-x-2 flex justify-center items-center"
                        >
                          <Globe size={20} /> www
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="bg-primary/50">
                      <p className="text-foreground">
                        Importe la recette depuis un site web !
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {!userInfos[0].premium &&
                !isDateBeforeToday(userInfos[0].last_ai_use) ? (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="mb-4">Aie !</DialogTitle>
                      <DialogDescription>
                        Tu n'as droit qu'à une seule utilisation de l'IA par
                        jour.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose className="flex gap-x-2">
                        <Button variant="outline">Retour</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                ) : (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="mb-4">
                        Importation depuis un site web
                      </DialogTitle>
                      <DialogDescription>
                        Colle le lien vers le site de la recette
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      value={websiteUrl}
                      onChange={(ev) => setWebsiteUrl(ev.target.value)}
                      type="text"
                      placeholder="www.prout.com"
                    />
                    <DialogFooter>
                      <DialogClose className="flex gap-x-2">
                        <Button variant="outline">Annuler</Button>
                        <Button
                          className="bg-primary/50"
                          onClick={handleWebsiteImport}
                        >
                          Importer
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                )}
              </Dialog>
              {userInfos[0].premium ||
              isDateBeforeToday(userInfos[0].last_ai_use) ? (
                <div>
                  <Input
                    className="hidden"
                    ref={InputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={handleButtonClick}
                          className="gap-x-2 flex justify-center items-center"
                        >
                          <Brain size={20} /> AI
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-primary/50">
                        <p className="text-foreground">
                          Importe la photo d'une recette et complète
                          automatiquement tous les champs !
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <Dialog>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="gap-x-2 flex justify-center items-center"
                          >
                            <Brain size={20} /> AI
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="bg-primary/50">
                        <p className="text-foreground">
                          Importe la photo d'une recette et complète
                          automatiquement tous les champs !
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="mb-4">Aie !</DialogTitle>
                      <DialogDescription>
                        Tu n'as droit qu'à une seule utilisation de l'IA par
                        jour.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose className="flex gap-x-2">
                        <Button variant="outline">Retour</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
          <form onSubmit={handleValidation}>
            <Button
              disabled={!name || !count || ingredients.length === 0}
              type="submit"
              variant={"outline"}
            >
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
      </div>
    </div>
  );
};

export default CreationForm;
