"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PageTitle = () => {
  const [title, setTitle] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (
      pathname === "/protected/recipes" ||
      pathname.includes("/protected/detailed")
    ) {
      setTitle("Mes recettes");
    }
    if (pathname === "/protected/list") {
      setTitle("Mes listes de courses");
    }
    if (pathname === "/protected/agenda") {
      setTitle("Mon agenda");
    }
    if (pathname === "/protected/friends") {
      setTitle("Mes amis");
    }
  }, [pathname]);

  return <h1 className="text-lg capitalize font-bold">{title}</h1>;
};

export default PageTitle;
