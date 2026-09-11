#!/usr/bin/env bash
# 8x agent capture hook  —  naano-rebuild
#
# Writes one markdown log per Claude Code session into .agent-logs/.
#
# CONTENT comes ONLY from the hook payload:
#   UserPromptSubmit -> .prompt                 (the user message, verbatim)
#   Stop             -> .last_assistant_message (the final response for that turn)
# That is exactly the prompt/response pair 8x asks for: no thinking, no tool
# calls, no intermediate steps. The transcript is NEVER parsed for content —
# doing so would pull in tool results (file contents, env values) and break both
# the "nothing in between" spec and the no-secrets rule. transcript_path is read
# only to resolve the model name, which is absent from the hook payload.
#
# The hook must never block the session: it always exits 0.

set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
LOG_DIR="$PROJECT_DIR/.agent-logs"
AUTHOR="mawaisismail"
PROJECT_NAME="naano-rebuild"

payload=$(cat)
[ -z "$payload" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
mkdir -p "$LOG_DIR" || exit 0

event=$(printf '%s' "$payload"    | jq -r '.hook_event_name // empty')
session=$(printf '%s' "$payload"  | jq -r '.session_id // empty')
transcript=$(printf '%s' "$payload" | jq -r '.transcript_path // empty')
[ -z "$session" ] && exit 0

case "$event" in
  UserPromptSubmit) type="PROMPT";   body=$(printf '%s' "$payload" | jq -r '.prompt // empty') ;;
  Stop)             type="RESPONSE"; body=$(printf '%s' "$payload" | jq -r '.last_assistant_message // empty') ;;
  *) exit 0 ;;
esac
[ -z "$body" ] && exit 0

short="${session:0:8}"
ts=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)

# model name: last "model" seen in the transcript. Metadata only, never content.
model="unknown"
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  m=$(grep -o '"model":"[^"]*"' "$transcript" 2>/dev/null | tail -1 | cut -d'"' -f4)
  [ -n "$m" ] && model="$m"
fi

file=$(ls "$LOG_DIR"/*_"$session".md 2>/dev/null | head -1)
if [ -z "$file" ]; then
  file="$LOG_DIR/$(date -u +%Y-%m-%d_%H-%M-%S)_$session.md"
  cat > "$file" <<FM
---
session_id: $session
date: $(date -u +%Y-%m-%d)
author: $AUTHOR
model: $model
tool: Claude Code (CLI)
project: $PROJECT_NAME
total_exchanges: 0
first_prompt_time: $ts
last_prompt_time: $ts
---
FM
fi

prompts=$(grep -c '^\[LOG_ENTRY type=PROMPT ' "$file" 2>/dev/null || true)
prompts=${prompts:-0}
if [ "$type" = "PROMPT" ]; then num=$((prompts + 1)); else num=$prompts; fi
[ "$num" -lt 1 ] && num=1

# Append only. Entries are never edited or removed after the fact.
{
  printf '\n[LOG_ENTRY type=%s num=%s session=%s]\n' "$type" "$num" "$short"
  printf 'timestamp: %s\n' "$ts"
  printf 'model: %s\n\n' "$model"
  printf '%s\n' "$body"
} >> "$file"

# Frontmatter counters are bookkeeping, not entries — safe to update in place.
# Restricted to the frontmatter block so a pasted log-shaped prompt can't corrupt it.
total=$(grep -c '^\[LOG_ENTRY type=PROMPT ' "$file" 2>/dev/null || true)
total=${total:-0}
lastt=""
[ "$type" = "PROMPT" ] && lastt="$ts"

awk -v total="$total" -v lastt="$lastt" -v mdl="$model" '
  NR == 1 { infm = 1 }
  infm && NR > 1 && /^---$/ { infm = 0 }
  infm && /^total_exchanges:/   { print "total_exchanges: " total; next }
  infm && /^last_prompt_time:/  && lastt != ""      { print "last_prompt_time: " lastt; next }
  infm && /^model:/             && mdl != "unknown" { print "model: " mdl; next }
  { print }
' "$file" > "$file.tmp" 2>/dev/null && mv "$file.tmp" "$file"

exit 0
