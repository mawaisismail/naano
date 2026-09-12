#!/usr/bin/env node
/**
 * Regenerate and verify every agent log, in one command.
 *
 * "No session was missed" is only true if something enforces it. This holds
 * the list of sessions that built the project, finds each transcript wherever
 * Claude Code put it, rebuilds its log, and then verifies the result. A
 * session named here whose transcript cannot be found is a hard failure, not a
 * silent skip — that is the failure mode this exists to catch.
 *
 * Discovery by working directory is not enough on its own: the kickoff session
 * ran in a different project's directory, so it would never be found that way.
 * It is pinned by id below instead, with the reason it belongs.
 *
 * Run it before submitting. The exchange in flight at the moment it runs is
 * written by the next run, so the last one to execute should be after the
 * final turn of the session.
 *
 * Usage: npm run logs
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const AUTHOR = "mawaisismail";

/** Every session that worked on this project. Add to this, never trim it. */
const SESSIONS = [
  {
    id: "4200849e-64c3-476c-8f5a-bedf89efb32f",
    note: "kickoff — the brief, and the capture harness. Ran in another directory.",
  },
  {
    id: "6616eb0a-3c0d-48c8-bd0b-7ddbeee76e07",
    note: "the build.",
  },
];

const ROOT = join(homedir(), ".claude", "projects");

/** Claude Code files a transcript under a directory named for its cwd, so the
 *  id has to be looked up rather than assumed. */
function findTranscript(id) {
  for (const dir of readdirSync(ROOT)) {
    const p = join(ROOT, dir, `${id}.jsonl`);
    if (existsSync(p)) return p;
  }
  return null;
}

const run = (script, args) =>
  execFileSync("node", [join("scripts", script), ...args], { encoding: "utf8" });

let failed = 0;
for (const { id, note } of SESSIONS) {
  console.log(`\n${id}  — ${note}`);
  const transcript = findTranscript(id);
  if (!transcript) {
    console.error(`  MISSING TRANSCRIPT: no ${id}.jsonl under ${ROOT}`);
    console.error("  The log for this session cannot be rebuilt. Do not submit without it.");
    failed = 1;
    continue;
  }

  const written = run("backfill-agent-log.mjs", [transcript, AUTHOR]).trim();
  const file = written.split("\n")[0].replace(/^wrote /, "");
  console.log(written.split("\n").map((l) => `  ${l}`).join("\n"));

  try {
    console.log(
      run("verify-agent-log.mjs", [transcript, file])
        .trim()
        .split("\n")
        .map((l) => `  ${l}`)
        .join("\n")
    );
  } catch (e) {
    console.error(String(e.stdout ?? "").split("\n").map((l) => `  ${l}`).join("\n"));
    failed = 1;
  }
}

console.log(
  failed
    ? "\nFAIL: at least one log is incomplete."
    : `\nOK: ${SESSIONS.length} session(s) published and verified.`
);
process.exit(failed);
