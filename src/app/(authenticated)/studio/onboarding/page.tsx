import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isOnboarded } from "@/lib/creator-profile";
import { OnboardingWizard } from "./OnboardingWizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/studio/onboarding");
  if (user.role !== "creator") redirect("/app");
  if (isOnboarded(user)) redirect("/studio");

  return <OnboardingWizard name={user.name} />;
}
