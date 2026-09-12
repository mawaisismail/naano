import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { conversationsFor, threadFor } from "@/lib/messages";
import { markThreadRead } from "@/lib/actions/messages";
import { MessageThread } from "@/components/app/MessageThread";
import { ConversationList } from "@/components/app/ConversationList";

export const metadata = { title: "Messages — Naano" };

export default async function CreatorMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversations = await conversationsFor(user);
  const { thread } = await searchParams;

  // The selected thread lives in the URL, so a refresh, a back button and a
  // shared link all land in the same conversation.
  const selected = conversations.find((c) => c.dealId === thread) ?? conversations[0];
  const messages = selected ? await threadFor(selected.dealId) : [];
  if (selected) await markThreadRead(selected.dealId);

  return (
    <div className="mx-auto max-w-[1340px] pt-2">
      <h1 className="text-[40px] font-bold tracking-[-0.02em] text-[#111827]">Messages</h1>
      <p className="mt-2 text-[15px] leading-[26px] text-[#6B7280]">
        Conversations with the brands booking you.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-[18px] border border-dashed border-[#D7DCE5] bg-white p-12 text-center">
          <p className="text-sm font-semibold text-[#111827]">No conversations yet</p>
          <p className="mx-auto mt-2 max-w-[460px] text-sm leading-6 text-[#6B7280]">
            A thread opens as soon as a brand books you or accepts an
            application. Apply to a campaign and this fills in.
          </p>
          <Link
            href="/creator/opportunities"
            className="mt-6 inline-flex rounded-[10px] bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Browse opportunities
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <ConversationList items={conversations} active={selected?.dealId} base="/creator/messages" />
          </div>
          <div className="lg:col-span-8">
            {selected ? (
              <MessageThread
                dealId={selected.dealId}
                mine="creator"
                messages={messages}
                counterpart={selected.counterpart}
                subtitle={`${selected.campaign} · ${selected.status}`}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
