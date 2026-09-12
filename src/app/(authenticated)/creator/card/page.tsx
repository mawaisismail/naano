import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { CardWorkbench } from "./CardWorkbench";

export const metadata = { title: "My card — Naano" };

export default async function MyCardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <CardWorkbench
      user={{
        name: user.name,
        headline: user.headline,
        avatarUrl: user.avatarUrl,
        followers: user.followers,
        postCost: user.postCost,
        industries: user.industries,
        flag: user.flag,
        creatorSlug: user.creatorSlug,
      }}
    />
  );
}
