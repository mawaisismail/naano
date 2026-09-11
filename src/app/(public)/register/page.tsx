import Link from "next/link";
import { AuthPanel } from "@/components/AuthPanel";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Create an account — Naano" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const initial = role === "influencer" || role === "creator" ? "creator" : role === "saas" ? "brand" : null;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthPanel
        title="One platform. Two sides."
        body="Brands find the creators their buyers already trust. Creators get paid to write about products they actually use."
      />
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Already have one?{" "}
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
          <RegisterForm initialRole={initial} />
        </div>
      </div>
    </div>
  );
}
