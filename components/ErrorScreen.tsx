"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const ErrorScreen = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center w-full h-full gap-y-4">
      <p>Il y a eu une erreur ...</p>
      <Button variant="outline" onClick={() => router.refresh()}>
        Réessayer
      </Button>
    </div>
  );
};

export default ErrorScreen;
