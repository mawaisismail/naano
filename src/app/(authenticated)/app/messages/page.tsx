import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { conversationsFor, threadFor } from "@/lib/messages";
import { markThreadRead } from "@/lib/actions/messages";
import { MessageThread } from "@/components/app/MessageThread";
import { ConversationList } from "@/components/app/ConversationList";

export const metadata = { title: "Messages — Naano" };

/**
 * The brand's half of the same conversations the creator sees. Same data, same
 * thread component, counterpart swapped — so a message sent from the creator
 * workspace shows up here, which is the only way to tell whether messaging
 * actually works.
 */
export default async function BrandMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversations = await conversationsFor(user);
  const { thread } = await searchParams;
  const selected = conversations.find((c) => c.dealId === thread) ?? conversations[0];
  const messages = selected ? await threadFor(selected.dealId) : [];
  if (selected) await markThreadRead(selected.dealId);

  return (
    <div className="px-8 pb-16 pt-8">
      <h1 className="text-[32px] font-bold tracking-[-0.02em] text-[#111827]">Messages</h1>
      <p className="mt-2 text-[15px] text-[#6B7280]">
        Conversations with the creators you have booked.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-[18px] border border-dashed border-[#D7DCE5] bg-white p-12 text-center">
          <p className="text-sm font-semibold text-[#111827]">No conversations yet</p>
          <p className="mx-auto mt-2 max-w-[460px] text-sm leading-6 text-[#6B7280]">
            Book a creator and a thread opens here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <ConversationList items={conversations} active={selected?.dealId} base="/app/messages" />
          </div>
          <div className="lg:col-span-8">
            {selected ? (
              <MessageThread
                dealId={selected.dealId}
                mine="brand"
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
