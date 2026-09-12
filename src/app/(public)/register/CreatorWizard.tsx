import { MarketplaceCard } from "./MarketplaceCard";
import { StepLinkedIn, StepIndustries, StepCard, StepProfessional } from "./WizardSteps";
import { recommendedPostPrice } from "@/lib/linkedin-import";
import { LocaleButton } from "./parts";

type Creator = {
  name: string;
  onboardingStep: number;
  linkedinUrl: string | null;
  headline: string | null;
  avatarUrl: string | null;
  followers: number | null;
  postCost: number | null;
  industries: string[];
  country: string | null;
  flag: string | null;
  profileDataSource: string;
};

/**
 * Steps 2–4 of the creator wizard, in the same split-screen shell as step 1.
 *
 * Which step renders is decided here from the user row, not from client state:
 * a refresh, a new tab or coming back tomorrow all resume at the same place,
 * and a step cannot be skipped by editing a URL.
 */
export function CreatorWizard({ user }: { user: Creator }) {
  const followers = user.followers ?? 0;
  const step = user.onboardingStep;

  return (
    <div
      className="flex h-[100dvh] max-h-full min-h-0 overflow-hidden"
      style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="flex h-full min-h-0 flex-1 items-start justify-center overflow-y-auto overscroll-y-contain bg-white px-8 pb-10 pt-[clamp(1.75rem,7dvh,4.5rem)] sm:pb-12 xl:px-10">
        <div className="w-full max-w-md pb-4">
          <div className="mb-8 flex items-center justify-between gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="naano" className="h-7 w-auto object-contain" />
            <LocaleButton />
          </div>

          {step <= 2 ? (
            <StepLinkedIn defaultUrl={user.linkedinUrl} />
          ) : step === 3 ? (
            <StepIndustries selected={user.industries} />
          ) : step === 4 ? (
            <StepCard
              followers={followers}
              headline={user.headline ?? ""}
              avatarUrl={user.avatarUrl ?? ""}
              recommended={user.postCost ?? recommendedPostPrice(followers)}
              source={user.profileDataSource}
            />
          ) : (
            <StepProfessional country={user.country} />
          )}
        </div>
      </div>

      <div className="hidden h-full min-h-0 flex-1 items-start justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#FFFFFF_0%,#F1F6FF_46%,#EEF0FF_100%)] px-8 pb-10 pt-[clamp(1.75rem,7dvh,4.5rem)] lg:flex xl:px-12">
        <div className="flex w-full max-w-[560px] flex-col items-center">
          <div className="mb-4 max-w-[500px] text-center xl:mb-5">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">
              Your Marketplace card
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#111827] xl:text-3xl">
              Build a card brands can trust.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#596273]">
              It updates live with your profile, analytics, positioning and price.
            </p>
          </div>
          <MarketplaceCard
            name={user.name}
            headline={user.headline}
            avatarUrl={user.avatarUrl}
            followers={user.followers}
            postCost={step >= 4 ? user.postCost : null}
            industries={user.industries}
            flag={user.flag}
          />
        </div>
      </div>
    </div>
  );
}
