#!/usr/bin/env node
/**
 * Prove that .agent-logs/ missed nothing.
 *
 * The assignment's claim is "every prompt and every response, verbatim". This
 * checks it the only way that means anything: it re-reads the source
 * transcript, lists the prompts a person actually typed, and asserts that each
 * one appears in the published log with the same text.
 *
 * It fails loudly on three separate things, because they are three different
 * bugs:
 *   MISSING   a typed prompt that never reached the log
 *   ALTERED   a prompt whose logged text does not match the transcript
 *   EXTRA     a logged prompt with no typed prompt behind it, which is how an
 *             injected notice (a compaction summary, a task notification)
 *             gets published as if the user had written it
 *
 * The last prompt of a session is allowed to be absent: its response may not
 * exist yet when the log is written.
 *
 * Usage: node scripts/verify-agent-log.mjs <transcript.jsonl> <log.md>
 */
import { readFileSync } from "node:fs";

const [, , transcriptPath, logPath] = process.argv;
if (!transcriptPath || !logPath) {
  console.error("usage: node scripts/verify-agent-log.mjs <transcript.jsonl> <log.md>");
  process.exit(2);
}

const stripReminders = (s) =>
  s.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "").trim();

const textOf = (content) => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((b) => b && b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n")
    .trim();
};

/** Same rule as the backfill, restated here on purpose: a check that imports
 *  the thing it checks cannot catch a mistake in it. */
const typedPrompts = [];
for (const line of readFileSync(transcriptPath, "utf8").split("\n")) {
  if (!line.trim()) continue;
  let rec;
  try {
    rec = JSON.parse(line);
  } catch {
    continue;
  }
  if (rec.type !== "user" || rec.isMeta || rec.isCompactSummary) continue;
  const c = rec.message?.content;
  if (Array.isArray(c) && c.some((b) => b?.type === "tool_result")) continue;
  const t = stripReminders(textOf(c));
  if (!t) continue;
  if (/^<(command-name|command-message|local-command|bash-input|task-notification)/.test(t)) continue;
  if (/^\[Request interrupted by user/.test(t)) continue;
  typedPrompts.push({ at: rec.timestamp, text: t });
}

// Split the log on its own entry markers and keep the prompt bodies.
const log = readFileSync(logPath, "utf8");
const logged = [];
const parts = log.split(/^\[LOG_ENTRY type=(PROMPT|RESPONSE) num=(\d+) session=\w+\]$/m);
for (let i = 1; i < parts.length; i += 3) {
  if (parts[i] !== "PROMPT") continue;
  // drop the two header lines (timestamp:, model:) and the blank line after
  const body = parts[i + 2].replace(/^\s*timestamp:.*\n\s*model:.*\n\n?/, "").trim();
  logged.push({ num: Number(parts[i + 1]), text: body });
}

const norm = (s) => s.replace(/\s+/g, " ").trim();
const loggedSet = new Map(logged.map((l) => [norm(l.text), l.num]));

const missing = [];
for (const [i, p] of typedPrompts.entries()) {
  if (loggedSet.has(norm(p.text))) continue;
  // the final prompt may still be in flight
  if (i === typedPrompts.length - 1) continue;
  missing.push({ i: i + 1, at: p.at, head: p.text.slice(0, 90) });
}

const transcriptSet = new Set(typedPrompts.map((p) => norm(p.text)));
const extra = logged.filter((l) => !transcriptSet.has(norm(l.text)));

console.log(`transcript: ${typedPrompts.length} typed prompt(s)`);
console.log(`log:        ${logged.length} prompt entr(ies), ${(log.match(/type=RESPONSE/g) ?? []).length} response entr(ies)`);

for (const m of missing) console.log(`  MISSING #${m.i} ${m.at} — ${m.head}`);
for (const e of extra) console.log(`  EXTRA   entry ${e.num} — ${e.text.slice(0, 90)}`);

if (missing.length || extra.length) {
  console.error(`\nFAIL: ${missing.length} missing, ${extra.length} extra`);
  process.exit(1);
}
console.log("\nOK: every typed prompt is published, and nothing else is.");
