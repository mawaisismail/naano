/**
 * Pure, dependency-free. Deliberately its own module: the onboarding wizard is
 * a client component and needs slugify for the live preview, and importing it
 * from creator-profile.ts would drag Prisma and node:module into the browser
 * bundle — which fails the build rather than merely bloating it.
 */
export const slugify = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "creator";
