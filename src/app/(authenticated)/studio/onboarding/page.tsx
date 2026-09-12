import { redirect } from "next/navigation";

/** Onboarding now runs on /register?role=influencer, where naano keeps it. */
export default function OnboardingPage() {
  redirect("/register?role=influencer");
}
