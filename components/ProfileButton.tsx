"use client";

import { User } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { signOut } from "@/serverFunctions/auth/serverFunctions";
import { usePathname } from "next/navigation";
import { User as Usr } from "@supabase/supabase-js";

export function ProfileButton({
  user,
  userUniqueId,
}: {
  user: Usr | null;
  userUniqueId: string | null;
}) {
  const pathname = usePathname();
  const name = user?.user_metadata.full_name as string;

  if (pathname !== "/login" && pathname !== "/signup") {
    return (
      <div className="scale-75 md:scale-100 flex justify-end items-center z-50 gap-x-2">
        <div className="flex h-10 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm">
          <div className="px-2 h-full flex justify-center items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-md transition-all">
            <Drawer direction="right">
              <DrawerTrigger>
                <User size={20} />
              </DrawerTrigger>
              <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] max-w-[90vw] rounded-none flex flex-col justify-start items-center">
                <DrawerHeader className="mt-[10vh] w-full flex flex-col justify-center items-center">
                  <Avatar className="scale-[300%] mb-16">
                    <AvatarFallback>{name[0]}</AvatarFallback>
                  </Avatar>
                  <h1 className="text-3xl">{name}</h1>
                  <h2 className="text-2xl text-foreground/40">
                    #{userUniqueId}
                  </h2>
                </DrawerHeader>
                <DrawerFooter className="flex flex-row justify-center items-center gap-x-2 mb-4">
                  <DrawerClose>
                    <Button variant="outline">Annuler</Button>
                  </DrawerClose>
                  <form action={signOut}>
                    <Button
                      variant="outline"
                      className="hover:bg-destructive/80"
                    >
                      Se déconnecter
                    </Button>
                  </form>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
        <div className="flex flex-col justify-center items-start">
          <span className="text-sm">{user?.user_metadata.full_name}</span>
          <span className="text-xs text-foreground/50">#{userUniqueId}</span>
        </div>
      </div>
    );
  }
}
