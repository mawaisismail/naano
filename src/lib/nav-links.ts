/**
 * Nav data shared by a server component (Nav) and a client one (ResourcesMenu).
 * It cannot live in the client module: a "use client" file's exports arrive at
 * the server as client references, so importing the array there yields a proxy
 * rather than the data, and spreading it throws at render time.
 */
export const RESOURCES = [
  ["Blog", "/blog"],
  ["Free Tools", "/free-tools"],
  ["Case study: BlogSEO", "/case-studies/blogseo"],
] as const;
