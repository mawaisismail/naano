"use client";

import { useActionState, useEffect, useRef } from "react";
import { SendHorizontal } from "lucide-react";
import { sendMessage, type MessageState } from "@/lib/actions/messages";

/**
 * One conversation, shared by both sides of the marketplace.
 *
 * `mine` is the viewer's role rather than a user id: a thread has exactly two
 * sides, so which bubble is yours is decided by which side of the booking you
 * are on. The same component serves the creator workspace and the brand app.
 */

export type Msg = {
  id: string;
  senderRole: string;
  senderName: string;
  body: string;
  at: string;
};

export function MessageThread({
  dealId,
  mine,
  messages,
  counterpart,
  subtitle,
}: {
  dealId: string;
  mine: string;
  messages: Msg[];
  counterpart: string;
  subtitle: string;
}) {
  const [state, action, pending] = useActionState<MessageState, FormData>(sendMessage, null);
  const formRef = useRef<HTMLFormElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Jump to the newest message on open and after each send, the way every
  // chat behaves — reading a thread from the top is nobody's intent.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Clear the composer once the send has actually gone through, not on submit:
  // a failed send must leave the text where the writer can retry it.
  useEffect(() => {
    if (!pending && !state?.error) formRef.current?.reset();
  }, [pending, state]);

  return (
    <section className="flex min-h-[560px] flex-col rounded-[18px] border border-[#E5E7EB] bg-white">
      <header className="border-b border-[#EEF0F4] px-6 py-4">
        <h2 className="text-[17px] font-bold text-[#111827]">{counterpart}</h2>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">{subtitle}</p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#6B7280]">
            No messages yet. Say hello — this is where the brief gets agreed.
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.senderRole === mine;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[76%]">
                  <div
                    className={`rounded-[16px] px-4 py-3 text-sm leading-6 ${
                      isMine
                        ? "rounded-br-[6px] bg-[#2563eb] text-white"
                        : "rounded-bl-[6px] bg-[#F3F4F6] text-[#111827]"
                    }`}
                  >
                    {m.body}
                  </div>
                  <p className={`mt-1 text-[11px] text-[#9CA3AF] ${isMine ? "text-right" : ""}`}>
                    {isMine ? "You" : m.senderName} · {m.at}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form ref={formRef} action={action} className="border-t border-[#EEF0F4] p-4">
        <input type="hidden" name="dealId" value={dealId} />
        {state?.error ? (
          <p role="alert" className="mb-2 text-[13px] text-[#8A4B22]">
            {state.error}
          </p>
        ) : null}
        <div className="flex items-end gap-2.5">
          <textarea
            name="body"
            rows={2}
            required
            maxLength={4000}
            placeholder="Write a message…"
            aria-label="Message"
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter makes a new line.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            className="min-h-[52px] flex-1 resize-none rounded-[12px] border border-[#E5E7EB] px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
          <button
            disabled={pending}
            className="inline-flex h-[52px] items-center gap-2 rounded-[12px] bg-[#2563eb] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
          >
            <SendHorizontal size={16} strokeWidth={1.8} aria-hidden />
            {pending ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}
