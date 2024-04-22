// pages/index.js
import Head from "next/head";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Contact,
  Contact2,
  Globe,
  List,
  Pen,
  ShoppingCart,
  Smile,
  Soup,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const WelcomePage = () => {
  return (
    <div className="relative flex flex-col w-full min-h-screen">
      <div className="bg-animated"></div>
      <header className="fixed w-full left-0 top-0 h-[80px] flex justify-between items-center px-[8%] z-10">
        <div>
          <Link href={"/welcome"} passHref>
            <div className="flex justify-center items-center w-full gap-x-3">
              <List />
              <h1 className="text-2xl font-bold">FeedMe</h1>
            </div>
          </Link>
        </div>
        <div className="flex justify-center items-center gap-x-4">
          <Link href={"/login"}>
            <Button variant="outline">Se Connecter</Button>
          </Link>
          <Link href={"/signup"}>
            <Button className="gap-x-1">
              Commencer gratuitement <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </header>
      <main className="relative flex-1 mt-20 z-10 overflow-y-auto">
        <div className="flex flex-row w-full justify-between items-center min-h-[70vh] mt-14 px-[8%]">
          <div className="flex flex-col justify-center items-start w-full px-4 gap-y-6">
            <span className="text-6xl font-extrabold text-left">
              Une gestion parfaite de tes recettes préférées
            </span>
            <span className="text-xl font-light text-left">
              Une application pour <span className="font-bold">gérer </span> tes
              recettes, <span className="font-bold">accélérer </span>
              tes courses, <span className="font-bold">planifier </span> ta
              semaine ou encore <span className="font-bold">partager </span> tes
              recettes avec tes amis !
            </span>
            <Link href={"/signup"}>
              <Button className="gap-x-1">
                Commencer gratuitement <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
          <div className="flex justify-center items-center w-full p-14">
            <Image
              src={"/bg-login-3.png"}
              alt=""
              width={800}
              height={800}
            ></Image>
          </div>
        </div>
        <div className="flex flex-row w-full justify-between items-center min-h-[55vh] gap-x-10 px-[8%]">
          <div className="flex justify-center items-center w-full px-6">
            <Image
              className="border rounded-xl"
              src={"/recettes.png"}
              alt=""
              width={800}
              height={800}
            ></Image>
          </div>
          <div className="flex flex-col justify-center items-start w-full px-4 gap-y-10 ps-10">
            <div className="flex flex-col justify-center items-start w-full gap-y-2">
              <span className="text-3xl font-bold text-left">
                Toutes tes recettes au même endroit !
              </span>
              <span className="text-md text-left">
                Ne perds plus jamais les traces des recettes que tu trouves
              </span>
            </div>
            <div className="flex flex-col justify-start items-start gap-y-4">
              <div className="flex justify-start items-center gap-x-4">
                <Pen className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Crée tes propres recettes
                </span>
              </div>
              <div className="flex justify-start items-center gap-x-4">
                <Globe className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Importe des recettes depuis des sites web
                </span>
              </div>
              <div className="flex justify-start items-center gap-x-4">
                <Camera className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Importe des recettes depuis une photo
                </span>
              </div>
              <div className="flex justify-start items-center gap-x-4">
                <Contact className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Enregistre les recettes de tes amis
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row w-full justify-between items-center min-h-[55vh] gap-x-10 px-[8%]">
          <div className="flex flex-col justify-center items-start w-full px-4 gap-y-10 ps-10">
            <div className="flex flex-col justify-center items-start w-full gap-y-2">
              <span className="text-3xl font-bold text-left">
                Tes listes de courses super rapidemment !
              </span>
              <span className="text-md text-left">
                Génère tes listes de courses en un clic
              </span>
            </div>
            <div className="flex flex-col justify-start items-start gap-y-4">
              <div className="flex justify-start items-center gap-x-4">
                <ShoppingCart className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Génère tes listes à partir de tes recettes
                </span>
              </div>
              <div className="flex justify-start items-center gap-x-4">
                <Contact2 className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Des listes partagées pour faire les courses avec tes amis
                </span>
              </div>
              <div className="flex justify-start items-center gap-x-4">
                <CalendarDays className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Une liste de course pour la semaine grâce à l'agenda
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center w-full px-6">
            <Image
              className="border rounded-xl"
              src={"/liste.png"}
              alt=""
              width={800}
              height={800}
            ></Image>
          </div>
        </div>
        <div className="flex flex-row w-full justify-between items-center min-h-[55vh] gap-x-10 px-[8%]">
          <div className="flex justify-center items-center w-full px-6">
            <Image
              className="border rounded-xl"
              src={"/agenda.png"}
              alt=""
              width={800}
              height={800}
            ></Image>
          </div>
          <div className="flex flex-col justify-center items-start w-full px-4 gap-y-10 ps-10">
            <div className="flex flex-col justify-center items-start w-full gap-y-2">
              <span className="text-3xl font-bold text-left">
                Planification grâce à l'agenda
              </span>
              <span className="text-md text-left">
                Parfait pour être l'esprit tranquille toute la semaine
              </span>
            </div>
            <div className="flex flex-col justify-start items-start gap-y-4">
              <div className="flex justify-start items-center gap-x-4">
                <Smile className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Une interface visuelle et intuitive
                </span>
              </div>
              <div className="flex justify-start items-center gap-x-4">
                <Pen className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Planifie les repas et le nombre de personnes
                </span>
              </div>
              <div className="flex justify-start items-center gap-x-4">
                <ShoppingCart className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Génère une liste de courses depuis ton agenda
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row w-full justify-between items-center min-h-[55vh] gap-x-10 px-[8%]">
          <div className="flex flex-col justify-center items-start w-full px-4 gap-y-10 ps-10">
            <div className="flex flex-col justify-center items-start w-full gap-y-2">
              <span className="text-3xl font-bold text-left">
                Partages tes recettes avec tes amis !
              </span>
              <span className="text-md text-left">
                Partager ses recettes n'a jamais été aussi simple
              </span>
            </div>
            <div className="flex flex-col justify-start items-start gap-y-4">
              <div className="flex justify-start items-center gap-x-4">
                <Contact className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Accède aux recettes enregistrées de tes amis
                </span>
              </div>
              <div className="flex justify-start items-center gap-x-4">
                <Soup className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Importe les recettes qui te plaisent
                </span>
              </div>
              <div className="flex justify-start items-center gap-x-4">
                <ShoppingCart className="text-primary/50" size={20} />
                <span className="text-left font-bold">
                  Crée des groupes d'amis pour faire tes courses de manière
                  partagée
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center w-full px-6">
            <Image
              className="border rounded-xl"
              src={"/friends.png"}
              alt=""
              width={800}
              height={800}
            ></Image>
          </div>
        </div>
        <footer className="w-full flex justify-center items-center py-[100px]">
          <p>
            Fait avec ❤️ par <span className="font-bold"> Lucas Vermeulen</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default WelcomePage;
