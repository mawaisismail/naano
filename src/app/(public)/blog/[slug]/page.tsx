import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsNav } from "@/components/site/DocsNav";
import { DocsFooter } from "@/components/site/DocsFooter";
import { ALL_POSTS, findPost } from "@/lib/blog";

/**
 * /blog/[slug].
 *
 * The Journal's titles, categories and slugs are naano's, so every link on the
 * index and in the footer resolves. The article bodies are their writing and
 * are not reproduced: this page shows the piece's details and says plainly
 * that the text lives on naano.com, rather than inventing paragraphs and
 * putting their name on them.
 */

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  return post
    ? { title: `${post.title} | Naano`, description: post.excerpt }
    : { title: "Article | Naano" };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  const more = ALL_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  return (
    <div className="nn-doc bg-white">
      <DocsNav />

      <article className="px-4 pb-24 pt-32 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-[884px]">
          <Link href="/blog" className="text-[14px] font-medium text-[#1652F0] transition hover:opacity-70">
            ← Naano Journal
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[12px] text-[#4B5563]">
              {post.category}
            </span>
            <span className="text-[13px] text-[#6B7280]">
              {post.readMins} min read · {post.date}
            </span>
          </div>

          <h1 className="mt-6 font-light leading-[1.04] tracking-[-0.025em] text-[#111827] text-[clamp(32px,4.6vw,58px)]">
            {post.title}
          </h1>
          <p className="mt-6 text-[19px] leading-[1.7] text-[#111827]">{post.excerpt}</p>

          <div className="mt-10 rounded-[18px] border border-[#ECEAE6] bg-[#FAFAF9] p-7">
            <div className="text-[15px] font-semibold text-[#17181C]">
              The full article lives on naano.com
            </div>
            <p className="mt-2.5 text-[15px] leading-[1.65] text-[#55575E]">
              This build is a rebuild of naano.com made as a take-home exercise.
              The Journal index, categories and links are reproduced so the site
              navigates exactly as theirs does, but the writing is Naano&rsquo;s
              and is not copied here.
            </p>
            <a
              href={`https://naano.com/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-[#1652F0] transition hover:opacity-70"
            >
              Read it on naano.com
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7 17 17 7" />
                <path d="M9 7h8v8" />
              </svg>
            </a>
          </div>

          {more.length ? (
            <div className="mt-14">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                More on {post.category}
              </div>
              <ul className="mt-5 divide-y divide-[#ECEAE6]">
                {more.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="flex items-center justify-between gap-6 py-4 transition hover:opacity-70"
                    >
                      <span className="text-[16px] font-medium leading-[24px] text-[#111827]">
                        {p.title}
                      </span>
                      <span className="shrink-0 text-[13px] text-[#6B7280]">{p.readMins} min</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </article>

      <DocsFooter />
    </div>
  );
}
