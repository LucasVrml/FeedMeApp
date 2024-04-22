"use client";

import Link from "next/link";
import {
  CalendarDays,
  Contact,
  List,
  ListChecks,
  Plus,
  Soup,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
export function NavBar({
  friendRequestsNumber,
}: {
  friendRequestsNumber: number;
}) {
  const pathname = usePathname();

  return (
    <div className="w-[20vw] h-full flex flex-col justify-start items-center border-r pt-2 px-4 bg-card">
      {pathname !== "/login" && pathname !== "/signup" && (
        <>
          <Link href={"/welcome"} passHref>
            <div className="flex justify-center items-center w-full px-4 gap-x-3 mb-6 mt-2">
              <List />
              <h1 className="text-2xl font-bold">FeedMe</h1>
            </div>
          </Link>
          <Link href={"/protected/creation"}>
            <Button variant="outline" className="rounded-full">
              <Plus size={20} className="me-2" /> Créer une recette
            </Button>
          </Link>
          <div className="flex flex-col w-full h-full items-start justify-start gap-y-6 mt-7">
            <Link className="w-full" href="/protected/recipes/" passHref>
              <div
                className={`${pathname.includes("protected/recipes") ? "bg-slate-100 dark:bg-neutral-800" : "hover:bg-slate-100 dark:hover:bg-neutral-800"} gap-x-2 py-2 px-4 w-full flex justify-start items-center cursor-pointer rounded-md transition-all`}
              >
                <Soup size={20} />
                <span className="hidden md:block">Recettes</span>
              </div>
            </Link>
            <Link className="w-full" href="/protected/list" passHref>
              <div
                className={`${pathname.includes("protected/list") ? "bg-slate-100 dark:bg-neutral-800" : "hover:bg-slate-100 dark:hover:bg-neutral-800"} gap-x-2 py-2 px-4 h-full flex justify-start items-center cursor-pointer rounded-md transition-all`}
              >
                <List size={20} />
                <span className="hidden md:block whitespace-nowrap">
                  Listes de courses
                </span>
              </div>
            </Link>
            <Link className="w-full" href="/protected/agenda" passHref>
              <div
                className={`${pathname.includes("protected/agenda") ? "bg-slate-100 dark:bg-neutral-800" : "hover:bg-slate-100 dark:hover:bg-neutral-800"} gap-x-2 py-2 px-4 h-full flex justify-start items-center cursor-pointer rounded-md transition-all`}
              >
                <CalendarDays size={20} />
                <span className="hidden md:block">Agenda</span>
              </div>
            </Link>
            <Link className="w-full" href="/protected/friends" passHref>
              <div
                className={`${pathname.includes("protected/friends") ? "bg-slate-100 dark:bg-neutral-800" : "hover:bg-slate-100 dark:hover:bg-neutral-800"} gap-x-2 py-2 px-4 h-full flex justify-start items-center cursor-pointer rounded-md transition-all relative`}
              >
                <Contact size={20} />
                <span className="hidden md:block">Amis</span>
                {friendRequestsNumber > 0 && (
                  <div className="absolute flex justify-center items-center bg-destructive/50 w-6 h-6 top-0 right-0 rounded-full z-50 translate-x-2 -translate-y-2">
                    {friendRequestsNumber}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
