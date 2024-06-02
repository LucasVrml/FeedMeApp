"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { Minus, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import Link from "next/link";
import { LoadingSpinner } from "./LoadingSpinner";

const RecipePanelLoading = ({}: {}) => {
  return (
    <ResizablePanelGroup
      autoSaveId={"FriendsPanelSizes"}
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
            <b>Catégories</b>
            <div>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer transition-all h-full p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800">
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
          <div className="flex w-full flex-col justify-start items-start px-2 py-3 gap-y-3 overflow-y-scroll h-[88vh] noscrollbar"></div>
        </div>
      </ResizablePanel>
      <ResizableHandle className="hidden md:flex" />
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
          <div className="flex w-full flex-col justify-center items-center p-2 py-3 gap-y-2 overflow-scroll h-[88vh] noscrollbar">
            <LoadingSpinner />
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
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold tracking-tighter">{1}</div>
                  <div className="text-[0.70rem] uppercase text-muted-foreground">
                    Personne(s)
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 flex" />
          </div>
          <div className="flex w-full flex-col justify-center items-center py-6 px-[15%] overflow-scroll h-[88vh] noscrollbar">
            <LoadingSpinner />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default RecipePanelLoading;
