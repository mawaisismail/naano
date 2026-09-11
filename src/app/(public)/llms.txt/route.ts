/**
 * /llms.txt — naano publishes one for AI agents, and the footer links to it.
 * Served as plain text from a route handler rather than a page.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# Naano (rebuild)

> A B2B LinkedIn creator marketplace: companies book vetted creators at a
> fixed price per post and trace pipeline back to each one.

This site is a rebuild of naano.com made as a take-home exercise. It is not
affiliated with Naano, and the creators shown inside the product are invented.

## Pages
- /: the landing page
- /creators: for creators
- /agencies: for agencies
- /marketplace: browse creators
- /blog: the Naano Journal index
- /free-tools: free tools
- /case-studies/blogseo: BlogSEO case study
- /pricing, /faq: sections of the landing page

## Pricing
- Self-serve: EUR 0 per month, campaign spend separate
- Managed campaigns: custom quote
`;
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
