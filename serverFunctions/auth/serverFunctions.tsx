import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { getSupabase } from "../utils/getSupabaseInstance";

export const signOut = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/login");
};

export async function getUserUniqueId() {
  const { supabase, user } = await getSupabase();
  return await supabase.from("user").select("username").eq("id", user.id);
}

export async function getUserInfos() {
  const { supabase, user } = await getSupabase();
  return await supabase.from("user").select("*").eq("id", user.id);
}
