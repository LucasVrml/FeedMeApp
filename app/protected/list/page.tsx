import ErrorScreen from "@/components/ErrorScreen";
import List from "@/components/List";
import { getFriends } from "@/serverFunctions/friends/serverFunctions";
import { fetchLists } from "@/serverFunctions/list/serverFunctions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const ListPage = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  const { error, data } = await fetchLists();
  const { error: error2, data: friends } = await getFriends();

  if (error || error2) {
    return <ErrorScreen />;
  }

  return (
    <div className="flex flex-col w-full h-full justify-center items-center gap-y-4">
      <List data={data} friends={friends} />
    </div>
  );
};

export default ListPage;
