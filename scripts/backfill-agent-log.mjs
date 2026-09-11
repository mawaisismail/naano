#!/usr/bin/env node
/**
 * Backfill .agent-logs/ from a Claude Code session transcript.
 *
 * WHY THIS EXISTS, stated plainly: the capture hooks are installed correctly,
 * but Claude Code loads project settings at session start, and the sessions
 * that built this project began in the parent directory. No hook was ever armed
 * to catch them, so nothing was written live.
 *
 * This does NOT invent anything. Claude Code writes every session to a JSONL
 * transcript on disk; the prompts and responses below are read from that file
 * verbatim. Entries are reconstructed, not authored.
 *
 * It extracts exactly what the Stop / UserPromptSubmit hooks would have taken:
 *   - the user's typed prompt
 *   - the final assistant message of that turn
 * and nothing else. Tool calls, tool results, thinking and intermediate steps
 * are all dropped — that is both the assignment's "nothing in between" spec and
 * the reason this is safe to publish: tool results are where file contents and
 * environment values live.
 *
 * Harness-injected <system-reminder> blocks are stripped, because the hook's
 * `prompt` field never contained them — they are not user text.
 *
 * Usage: node scripts/backfill-agent-log.mjs <transcript.jsonl> <author>
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename } from "node:path";

const [, , transcriptPath, author = "unknown"] = process.argv;
if (!transcriptPath) {
  console.error("usage: node scripts/backfill-agent-log.mjs <transcript.jsonl> <author>");
  process.exit(1);
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

/** A real typed prompt, as opposed to a tool result or an injected notice. */
const isRealPrompt = (rec) => {
  if (rec.type !== "user") return false;
  if (rec.isMeta) return false;
  const c = rec.message?.content;
  if (Array.isArray(c) && c.some((b) => b?.type === "tool_result")) return false;
  const t = stripReminders(textOf(c));
  if (!t) return false;
  // command wrappers and local-command output are harness plumbing, not prompts
  if (/^<(command-name|command-message|local-command|bash-input)/.test(t)) return false;
  return true;
};

const records = [];
for (const line of readFileSync(transcriptPath, "utf8").split("\n")) {
  if (!line.trim()) continue;
  try {
    records.push(JSON.parse(line));
  } catch {
    /* a partially written final line is normal; skip it */
  }
}

const sessionId =
  records.find((r) => r.sessionId)?.sessionId ??
  basename(transcriptPath).replace(/\.jsonl$/, "");
const short = sessionId.slice(0, 8);

// Pair each prompt with the LAST assistant text before the next prompt — that
// is what the Stop hook receives as last_assistant_message.
const turns = [];
let current = null;
for (const rec of records) {
  if (isRealPrompt(rec)) {
    if (current) turns.push(current);
    current = {
      prompt: stripReminders(textOf(rec.message.content)),
      at: rec.timestamp,
      model: null,
      response: null,
      responseAt: null,
    };
  } else if (rec.type === "assistant" && current) {
    const t = textOf(rec.message?.content);
    if (t) {
      current.response = t;
      current.responseAt = rec.timestamp;
      current.model = rec.message?.model ?? current.model;
    }
  }
}
if (current) turns.push(current);

const complete = turns.filter((t) => t.response);
if (!complete.length) {
  console.error("no complete prompt/response pairs found");
  process.exit(1);
}

const model = complete.find((t) => t.model)?.model ?? "unknown";
const first = complete[0].at;
const last = complete[complete.length - 1].at;
const day = String(first).slice(0, 10);
const stamp = String(first).slice(11, 19).replace(/:/g, "-");

let out =
  `---\n` +
  `session_id: ${sessionId}\n` +
  `date: ${day}\n` +
  `author: ${author}\n` +
  `model: ${model}\n` +
  `tool: Claude Code (CLI)\n` +
  `project: naano-rebuild\n` +
  `total_exchanges: ${complete.length}\n` +
  `first_prompt_time: ${first}\n` +
  `last_prompt_time: ${last}\n` +
  `capture: backfilled from the local session transcript\n` +
  `capture_note: >\n` +
  `  The hooks in .claude/settings.json are installed and unit-verified, but\n` +
  `  Claude Code loads project settings at session start and this session began\n` +
  `  in the parent directory, so no hook was armed to write these live. The\n` +
  `  prompts and responses below are read verbatim from Claude Code's own\n` +
  `  transcript for this session. Nothing is authored, summarised or tidied.\n` +
  `  Tool calls, tool results and intermediate steps are excluded, matching what\n` +
  `  UserPromptSubmit and Stop would have captured.\n` +
  `---\n`;

complete.forEach((t, i) => {
  const n = i + 1;
  out += `\n[LOG_ENTRY type=PROMPT num=${n} session=${short}]\n`;
  out += `timestamp: ${t.at}\n`;
  out += `model: ${t.model ?? model}\n\n`;
  out += `${t.prompt}\n`;
  out += `\n[LOG_ENTRY type=RESPONSE num=${n} session=${short}]\n`;
  out += `timestamp: ${t.responseAt}\n`;
  out += `model: ${t.model ?? model}\n\n`;
  out += `${t.response}\n`;
});

mkdirSync(".agent-logs", { recursive: true });
const file = `.agent-logs/${day}_${stamp}_${sessionId}.md`;
writeFileSync(file, out);
console.log(`wrote ${file}`);
console.log(`  ${complete.length} exchanges, model ${model}`);
