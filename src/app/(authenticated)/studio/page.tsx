import { redirect } from "next/navigation";

/**
 * The creator workspace moved to /creator, which is the path naano uses.
 * This redirect keeps older links and bookmarks working.
 */
export default function StudioPage() {
  redirect("/creator");
}
