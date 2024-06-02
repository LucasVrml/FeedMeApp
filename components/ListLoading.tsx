"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
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
import { LoadingSpinner } from "./LoadingSpinner";

const ListLoading = ({}: {}) => {
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
          <div className="flex w-full flex-col justify-center items-start px-2 py-1">
            <div
              className={` w-full flex justify-center items-center rounded-md p-1 ps-2 transition-all cursor-pointer`}
            >
              <LoadingSpinner />
            </div>
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
          <div className="flex w-full flex-col justify-center items-center px-2 py-1 gap-y-3 overflow-y-scroll h-[70vh] noscrollbar">
            <LoadingSpinner />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={75} className="hidden md:flex">
        <div className="flex h-full w-full flex-col justify-start items-center">
          <div className="h-[6vh] border-b w-full flex justify-between items-center px-[7%]"></div>
          <div className="flex w-full flex-col justify-center items-center px-[7%] py-[7%] gap-y-3 overflow-scroll h-[88vh] noscrollbar">
            <div className="w-full border h-full rounded-xl flex p-10 justify-center items-center overflow-y-auto">
              <div className="w-full flex flex-col justify-center items-center gap-y-4">
                <LoadingSpinner />
              </div>
            </div>
            <form className="w-full flex gap-x-2">
              <Input type="text" placeholder="Ajoute un ingrédient" />
              <Button className="bg-primary/50 hover:bg-primary/50">
                <Plus />
              </Button>
              <Button
                variant={"outline"}
                className="hover:bg-destructive/90 hover:text-foreground"
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

export default ListLoading;
