/**
 * Says, on every screen that shows imported numbers, that this build generated
 * them. It reads profileDataSource rather than hardcoding the claim, so the
 * day a real LinkedIn import lands the banner disappears on its own.
 */
export function DemoDataBanner({ source }: { source: string }) {
  if (source !== "demo") return null;
  return (
    <div className="mb-5 rounded-[14px] border border-[#F2E2C0] bg-[#FDFAF2] px-4 py-3 text-[13px] leading-5 text-[#7A5A1E]">
      <strong className="font-semibold">Demo data.</strong> This build has no
      LinkedIn API access. The follower count and profile details below were
      generated when the profile was imported and are stored as{" "}
      <code className="rounded bg-white/70 px-1">profileDataSource=&quot;demo&quot;</code>.
      Post history and reach are genuinely empty — nothing has been invented to
      fill them.
    </div>
  );
}
