import { AccountMenu as Menu, type MenuItem } from "@/components/app/AccountMenu";

/** The creator workspace's items for the shared avatar menu. */
export function AccountMenu({
  name,
  email,
  avatarUrl,
  creatorSlug,
  needsProfessionalInfo,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  creatorSlug: string | null;
  needsProfessionalInfo: boolean;
}) {
  const items: MenuItem[] = [
    { href: "/creator/card", label: "My card", icon: "card" },
    ...(creatorSlug
      ? ([{ href: `/creators/${creatorSlug}`, label: "View public profile", icon: "external" }] as MenuItem[])
      : []),
    { href: "/creator/earnings", label: "Earnings and payouts", icon: "wallet" },
    {
      href: "/register?role=professional",
      label: "Professional information",
      icon: "settings",
      badge: needsProfessionalInfo ? "To do" : undefined,
    },
  ];

  return <Menu name={name} email={email} avatarUrl={avatarUrl} items={items} />;
}
