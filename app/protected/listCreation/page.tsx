import ErrorScreen from "@/components/ErrorScreen";
import ListCreationForm from "@/components/ListCreationForm";
import { getFriends } from "@/serverFunctions/friends/serverFunctions";

export default async function Page() {
  const { error, data } = await getFriends();

  if (error) {
    return <ErrorScreen />;
  }

  return (
    <div className="w-full h-full flex flex-col justify-start items-center gap-y-10 overflow-scroll relative pb-[100px] pt-[10vh]">
      <h3 className="text-2xl font-bold">Création de liste</h3>
      <ListCreationForm friends={data} inModal={false} />
    </div>
  );
}
