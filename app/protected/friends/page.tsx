"use server";

import ErrorScreen from "@/components/ErrorScreen";
import FriendsPanel from "@/components/FriendsPanel";
import { fetchAllFriendRecipesGroupedByFriend } from "@/serverFunctions/friends/serverFunctions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const Recipes = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  const { error, recipeData, askingFriends } =
    await fetchAllFriendRecipesGroupedByFriend();

  if (error) {
    return <ErrorScreen />;
  }

  return (
    <div className="flex w-full h-full justify-center items-center">
      <FriendsPanel data={{ error, recipeData, askingFriends }} />
    </div>
  );
};

export default Recipes;
