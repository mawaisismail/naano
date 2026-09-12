# CAPTURE-TEST

Verification that agent capture is installed and working for this project, per
step 4 of the 8x assignment.

> Status: **mechanism installed and unit-verified. The committed log is
> BACKFILLED from Claude Code's own session transcript, not captured live.**
> Why, and what that does and does not prove, is in section 5.

## 1. Tool and model

| | |
|---|---|
| Tool | Claude Code (CLI) |
| Model | `claude-opus-5` — Opus 5, 1M context |
| Planner / executor split | None. The same model plans and executes. There is no separate planning model, so there is no second stream of prompts to capture. |

## 2. Mechanism

Claude Code **hooks**, declared in the project's own `.claude/settings.json`:

| Hook event | Payload field used | Becomes |
|---|---|---|
| `UserPromptSubmit` | `.prompt` | `[LOG_ENTRY type=PROMPT]` |
| `Stop` | `.last_assistant_message` | `[LOG_ENTRY type=RESPONSE]` |

Both events invoke one script: `.claude/hooks/capture.sh`.

### Why only these two fields

These two fields are exactly, and only, what the assignment asks for: the prompt
that went in and the final response that came out — no thinking, no tool calls,
no intermediate steps.

The obvious-looking alternative is to parse `transcript_path` (the full JSONL
session transcript) and reconstruct the exchange from it. **We deliberately do
not do that.** The transcript contains every tool call and tool result, which
means file contents, command output and environment values. Parsing it would

1. violate the "prompt and final response, nothing in between" spec, and
2. be the single largest route for a credential to reach a public repo.

`transcript_path` is opened for exactly one purpose: reading the model name,
which is not present in the hook payload.

### Files changed

| File | Purpose |
|---|---|
| `.claude/settings.json` | Registers the two hooks. **Project-scoped.** |
| `.claude/hooks/capture.sh` | Appends entries to `.agent-logs/`. Append-only. |
| `.githooks/pre-commit` | Blocks a commit carrying a credential-shaped string in staged `.agent-logs/`. |
| `.gitignore` | `.agent-logs/` deliberately **not** ignored. |

The hooks are in the **project** settings file, never `~/.claude/settings.json`.
A user-level hook would capture every Claude Code session on this machine —
including unrelated client work — and publish it into this public repo. That is
a one-way mistake, so it is structurally prevented rather than remembered.

## 3. Log location and format

`.agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md`, one file per session: YAML
frontmatter (`session_id, date, author, model, tool, project, total_exchanges,
first_prompt_time, last_prompt_time`) followed by alternating `PROMPT` /
`RESPONSE` blocks.

Entries are **append-only**. They are never edited, tidied, summarised or
deleted. Only the frontmatter counters are rewritten in place, and that rewrite
is confined to the frontmatter block so that a prompt whose text happens to look
like frontmatter cannot corrupt the header — this is unit-tested, see below.

## 4. Verification

### 4a. Unit verification of the writer — PASSED

`capture.sh` was driven directly with synthetic hook payloads:

- a `UserPromptSubmit` payload with multi-line text, backticks and quotes → one
  correctly-formed `PROMPT` entry, verbatim, numbering `num=1`
- a `Stop` payload → matching `RESPONSE` entry at `num=1`
- a second exchange → `num=2` pair, `total_exchanges` advanced to 2
- **injection probe:** a prompt whose body was literally
  `total_exchanges: 999\nlast_prompt_time: HACKED`. The body was logged
  verbatim; the frontmatter was untouched and still read `total_exchanges: 2`.

### 4b. Secret gate — PASSED

Staged into `.agent-logs/` and committed against `.githooks/pre-commit`:

| Probe | Result |
|---|---|
| clean log | commit allowed |
| `sk-ant-api03-…` | **blocked** |
| `ghp_…` | **blocked** |
| `AKIAIOSFODNN7EXAMPLE` | **blocked** |
| `mongodb+srv://user:pw@…` | **blocked** |
| `password = <32 chars>` | **blocked** |

The gate **blocks the commit**; it never edits the log to remove the secret.
Editing an entry is forbidden by the assignment, and silently scrubbing a key
that has already been typed is worse than stopping — the key still needs
rotating. The block message says so.

### 4c. Live canary — NOT PERFORMED

No live canary was run, and none of the sessions that built this project were
captured by the hook at the time. Claiming otherwise would be false, so this
section says so.

### 4d. Backfill from the session transcript — DONE

`.agent-logs/` is populated by `scripts/backfill-agent-log.mjs`, reading Claude
Code's own JSONL transcript. Two sessions built this project and **both** are
published:

| File | Session | Exchanges |
| --- | --- | --- |
| `2026-09-09_18-28-29_4200849e….md` | the kickoff: the brief, and this harness | 4 |
| `2026-09-09_19-08-47_6616eb0a….md` | the build | 90 |

94 exchanges in total. The kickoff session ran in a different directory, which
is why it is a separate file and why neither was captured live (see section 5).

Both are rebuilt and checked by one command, `npm run logs`. The sessions are
listed by id in `scripts/agent-logs.mjs`: a session named there whose
transcript cannot be found is a hard failure rather than a silent skip, which
is the only way "no session was missed" can be enforced instead of asserted.
Discovery by working directory alone would never have found the kickoff
session, since it ran under another project's path.

What that is: the prompts and final responses in the committed log are read
**verbatim from disk**. Claude Code records every session; the material is
authentic, and nothing in the log is authored, summarised or tidied.

What that is not: proof the hook fired. It did not. The log is a reconstruction
of what the hook *would* have written, from the same underlying conversation.

The extractor takes only two things per turn — the user's typed prompt and the
final assistant message — and drops tool calls, tool results, thinking and every
intermediate step. That is the assignment's "nothing in between" spec, and it is
also why the result is safe to publish: tool results are where file contents and
environment values live.

Harness-injected `<system-reminder>` blocks are stripped, because the hook's
`prompt` field never contained them — they are not user text.

Four kinds of message arrive in the user stream without anyone typing them, and
each would otherwise be published as if the user had written it. All four are
dropped: the multi-thousand-word **compaction summary** the harness writes when
a session runs out of context, **background-task notifications**, the
**`[Request interrupted by user]`** marker, and slash-command plumbing. What
remains is what a person typed.

Verified before committing, by `scripts/verify-agent-log.mjs` rather than by
eye. It re-reads the transcript, lists the typed prompts, and fails on three
distinct faults — a prompt **missing** from the log, a logged prompt whose text
is **altered**, and an **extra** entry with no typed prompt behind it:

```
$ npm run logs
transcript: 91 typed prompt(s)
log:        90 prompt entr(ies), 90 response entr(ies)

OK: every typed prompt is published, and nothing else is.
```

The 91st is the exchange that was in flight while the log was written; its
response did not exist yet, and the next run picks it up. That gap is always
exactly one turn, and it closes by running `npm run logs` once more after the
final turn of a session. Run against the
earlier version of this log, the same check reported 22 missing prompts and 3
injected notices published as user text — which is why it exists.

Also verified:
- The output contains no `tool_result`, no `tool_use`, and no function-call
  markers.
- The repo's own pre-commit secret scan passes on both files. It has one
  narrow exception, added here: a credential-shaped string that already appears
  in the committed `.env.example` or CI workflow — the local Postgres
  placeholder `postgres:naano@localhost` — is not a disclosure. The exception
  reads the **committed** copies, so a placeholder cannot be introduced in the
  same commit that uses it as an excuse. Everything else still blocks, and that
  was re-tested with a planted token and a foreign database URL.
- Other sessions exist in the transcript directories — a gcloud install, an SSH
  key creation, and client work on an unrelated project. None of them touched
  this project and none is published.

## 5. What did not work

**A session started outside the project directory does not pick up the project's
hooks.** The harness was written from a Claude Code session whose working
directory was `~` (the parent of the project). After `.claude/settings.json`
existed, that session completed several further turns and `.agent-logs/` stayed
empty. Project settings are read once, when the session starts; creating them
mid-session does not retroactively arm it.

Consequence, stated plainly: no hook was ever armed to catch the build, so
nothing was written live. The log in this repo is therefore backfilled from the
transcript, as described in 4d, and labelled as such in its own frontmatter.
This file will not claim capture that did not happen.

The fix for anything from here on is to start the session from the project root,
where the hooks load at startup and write in real time.

**`create-next-app` refuses a non-empty directory.** The capture harness was
committed before any product code, so the directory already contained
`.agent-logs/` and `.githooks/`. Scaffolding was done in a temporary directory
and copied in, rather than reordering the work to put the scaffold first — the
harness landing before the code is the point.
