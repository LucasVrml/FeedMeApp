import ErrorScreen from "@/components/ErrorScreen";
import { ModeToggle } from "@/components/ModeToggle";
import { NavBar } from "@/components/NavBar";
import PageTitle from "@/components/PageTitle";
import { ProfileButton } from "@/components/ProfileButton";
import { getUserUniqueId } from "@/serverFunctions/auth/serverFunctions";
import { getAskingFriendsIds } from "@/serverFunctions/friends/serverFunctions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  const { error, data } = await getUserUniqueId();
  const { error: error2, data: askingFriendIds } = await getAskingFriendsIds();
  let friendRequestsNumber = 0;
  if (askingFriendIds) {
    friendRequestsNumber = askingFriendIds.length;
  }

  if (error || error2) {
    return (
      <div className="flex justify-center items-center w-full h-[100vh]">
        <ErrorScreen />
      </div>
    );
  }

  return (
    <div className="flex justify-start w-full h-[100vh] max-h-[100vh]">
      <NavBar friendRequestsNumber={friendRequestsNumber} />
      <div className="flex flex-col justify-start items-center w-full h-[100vh] max-h-[100vh] overflow-hidden">
        <div className="w-full border-b h-[6vh] flex justify-between items-center px-4 py-2 gap-x-4 bg-card z-50">
          <div>
            <PageTitle />
          </div>
          <div className="flex justify-center items-center gap-x-3 h-full">
            <div className="px-2 h-full flex justify-center items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-md transition-all">
              <ModeToggle />
            </div>
            <ProfileButton user={user} userUniqueId={data?.[0].username} />
          </div>
        </div>
        <div className="w-full h-[94vh] flex justify-center items-center">
          {children}
        </div>
      </div>
      {modal}
    </div>
  );
}
