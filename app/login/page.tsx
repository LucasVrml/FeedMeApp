import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "./submit-button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import Image from "next/image";

export default async function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return redirect("/protected/recipes");
  }

  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect(
        "/login?message=Il y a eu un problème, vérifiez vos informations ..."
      );
    }

    return redirect("/protected/recipes");
  };

  return (
    <div className="w-full flex justify-center items-center h-full gap-x-0">
      <div className="hidden min-w-[50%] h-[100vh] md:flex justify-center items-start relative border-r bg-custo shadow-2xl bg-white">
        <Link href={"/welcome"} passHref>
          <div className="flex justify-center items-center gap-x-3 top-8 left-8 absolute text-black">
            <List />
            <h1 className="text-2xl font-bold">FeedMe</h1>
          </div>
        </Link>
      </div>
      <div className="flex flex-col min-w-[50%] h-full px-8 justify-center items-center gap-y-10">
        <h1 className="text-center font-extrabold text-4xl">
          Bienvenue sur FeedMe !
        </h1>
        <h3 className="text-center text-md">
          FeedMe te permettra d'enregister toutes tes recettes, de générer des
          listes de course, d'échanger des recettes avec tes amis et bien plus !
        </h3>
        <form className="animate-in flex flex-col w-full justify-center gap-2 text-foreground max-w-md">
          <label className="text-md" htmlFor="email">
            Email
          </label>
          <Input
            className="rounded-md px-4 py-2 border mb-6"
            name="email"
            placeholder="you@example.com"
            required
          />
          <label className="text-md" htmlFor="password">
            Mot de passe
          </label>
          <Input
            className="rounded-md px-4 py-2 border mb-6"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
          <SubmitButton
            formAction={signIn}
            className="bg-primary/50 rounded-md px-4 py-2 text-foreground mb-2"
            pendingText="Connexion..."
          >
            Se Connecter
          </SubmitButton>
          <Link href="/signup" className="w-full">
            <Button variant="outline" className="w-full">
              Créer un compte
            </Button>
          </Link>
          {searchParams?.message && (
            <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
              {searchParams.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
