"use client";

import { weekRecipesPlanned } from "@/app/protected/agenda/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { MoveLeft, MoveRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlannedRecipes } from "@/hooks/usePlannedRecipes";
import DatePicker from "./DatePicker";
import { useResponseMiddleware } from "@/hooks/useResponseMiddleware";
import { allRecipes } from "@/database.types";
import { useToast } from "./ui/use-toast";

const AgendaPanel = ({
  weekRecipes,
  allRecipes,
  listIds,
}: {
  weekRecipes: weekRecipesPlanned;
  allRecipes: allRecipes;
  listIds: { list: { id: number; personal: boolean; name: string } }[];
}) => {
  const [offset, setOffset] = useState(0);
  const [weekRecipesState, setWeekRecipesState] = useState(weekRecipes);
  const [focusedDateRecipes, setFocusedDateRecipes] = useState<
    { id: number; name: string; count: number }[]
  >([]);
  const [focusedDate, setFocusedDate] = useState<string>("");
  const [focusedDay, setFocusedDay] = useState<number>();
  const [focusedMonth, setFocusedMonth] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    async function getCurrentRecipes() {
      const { error, data } = await usePlannedRecipes(offset);
      const res = useResponseMiddleware({ error, data }, toast);
      if (res) {
        setWeekRecipesState(res);
      }
    }
    getCurrentRecipes();
  }, [weekRecipes]);

  async function handleNextWeeks() {
    const { error, data } = await usePlannedRecipes(offset + 1);
    const res = useResponseMiddleware({ error, data }, toast);
    if (res) {
      setOffset((prev) => prev + 1);
      setWeekRecipesState(res);
    }
  }
  async function handlePreviousWeeks() {
    const { error, data } = await usePlannedRecipes(offset - 1);
    const res = useResponseMiddleware({ error, data }, toast);
    if (res) {
      setOffset((prev) => prev - 1);
      setWeekRecipesState(res);
    }
  }
  function getRange() {
    const firstDay = `${Object.values(weekRecipesState)[0].date} ${Object.values(weekRecipesState)[0].month}`;
    const lastDay = `${Object.values(weekRecipesState)[13].date} ${Object.values(weekRecipesState)[13].month}`;
    return `${firstDay} - ${lastDay}`;
  }
  const current = new Date();
  const currentDateParsed = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <div className="w-full h-[88vh] flex justify-center items-center gap-y-10 px-14 gap-x-8">
        <div className="w-full flex flex-col justify-end items-center gap-y-14 h-[70vh]">
          <div className="flex-1 flex justify-center items-center gap-x-4">
            <Button
              variant="outline"
              onClick={async () => handlePreviousWeeks()}
            >
              <MoveLeft />
            </Button>
            <div>{getRange()}</div>
            <Button variant="outline" onClick={async () => handleNextWeeks()}>
              <MoveRight />
            </Button>
          </div>
          <div className="grid grid-cols-7 justify-center justify-items-center gap-x-2 gap-y-2 w-full transition-all">
            {Object.values(weekRecipesState).map(
              ({ day, date, fullDate, month, recipes }) => {
                return (
                  <Card
                    key={fullDate}
                    className={`min-h-[30vh] max-h-[30vh] flex flex-col justify-start items-center overflow-x-hidden col-span-1 w-full cursor-pointer transition-all hover:bg-muted px-0 ${fullDate === currentDateParsed ? "bg-muted" : "bg-background"} ${fullDate === focusedDate && "bg-primary/50 hover:bg-primary/50"}`}
                    onClick={() => {
                      setFocusedDate(fullDate);
                      setFocusedDateRecipes(recipes);
                      setFocusedDay(date);
                      setFocusedMonth(month);
                    }}
                  >
                    <CardHeader className="flex justify-center items-center">
                      <CardTitle>{JSON.stringify(date)}</CardTitle>
                      <CardDescription className="capitalize">
                        {focusedDate ? day[0] : day}
                      </CardDescription>
                    </CardHeader>
                    {fullDate === focusedDate &&
                    focusedDateRecipes?.length &&
                    focusedDateRecipes?.length > 0 ? (
                      <CardContent className="w-full px-2 flex justify-center items-center gap-y-1">
                        <Card
                          className={`w-8 h-8 rounded-full bg-primary/50 px-2 flex justify-center items-center ${fullDate === focusedDate && "bg-secondary"}`}
                        >
                          {focusedDateRecipes?.length}
                        </Card>
                      </CardContent>
                    ) : (
                      <CardContent className="w-full px-2 flex flex-col justify-center items-center gap-y-1">
                        {focusedDate &&
                        recipes?.length &&
                        recipes?.length > 0 ? (
                          <Card
                            className={`w-8 h-8 rounded-full bg-primary/50 px-2 flex justify-center items-center ${fullDate === focusedDate && "bg-secondary"}`}
                          >
                            {recipes?.length}
                          </Card>
                        ) : (
                          <>
                            {recipes.map(({ id, name }) => {
                              return (
                                <Card
                                  key={id}
                                  className={`w-full bg-primary/50 px-2 flex justify-center items-center ${fullDate === focusedDate && "bg-secondary"}`}
                                >
                                  <span className="text-xs whitespace-nowrap overflow-hidden text-overflow-ellipsis">
                                    {name}
                                  </span>
                                </Card>
                              );
                            })}
                          </>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              }
            )}
          </div>
        </div>
        {focusedDate && (
          <div className="w-full flex justify-center items-center h-[70vh]">
            <Card className="flex flex-col gap-y-6 justify-center items-center w-full h-[70vh] px-14 relative pt-6">
              <h1 className="font-bold text-2xl">
                Les recettes pour le {`${focusedDay} ${focusedMonth}`}
              </h1>
              <div className="w-full flex flex-col justify-start items-center h-[60vh] overflow-scroll noscrollbar py-3">
                <DatePicker
                  setFocusedDateRecipes={setFocusedDateRecipes}
                  plannedRecipes={focusedDateRecipes}
                  allRecipes={allRecipes}
                  selectedDate={focusedDate}
                  listIds={listIds}
                />
                <Button
                  variant="outline"
                  className="absolute -top-3 -right-3 rounded-full w-8 h-8 flex justify-center items-center p-0"
                  onClick={() => setFocusedDate("")}
                >
                  <X />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaPanel;
