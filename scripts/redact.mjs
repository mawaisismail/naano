/**
 * Keep credentials out of .agent-logs/.
 *
 * The logs publish what the user typed, verbatim. People paste API keys and
 * connection strings into chat — it is the normal way to hand them to an agent
 * — and .agent-logs/ is public and permanent, so "verbatim" cannot mean
 * "including the key".
 *
 * Redaction is VISIBLE. Each removal leaves a marker naming what was taken,
 * so the log is not silently rewritten: a reader can see that something was
 * removed and what kind of thing it was. That is the difference between
 * redacting a secret and editing a log entry, which 8x forbids.
 *
 * Two passes, in this order:
 *
 *   1. By value. Every secret in the local .env is matched literally wherever
 *      it appears — inside a URI, on a line of its own, in prose. This is the
 *      reliable one: it needs no pattern to recognise the shape of a key it
 *      has never seen.
 *   2. By shape. A safety net for credentials that never reached .env —
 *      provider key prefixes, and any URI carrying a password.
 */
import { readFileSync, existsSync } from "node:fs";

/** Env keys whose values are secret. NEXT_PUBLIC_* is published by design. */
const SECRET_KEY = /(KEY|SECRET|PASSWORD|TOKEN|URI|URL|DSN|CERT)$/i;

/** Short or obviously non-secret values would redact half the log. */
const MIN_SECRET_LEN = 12;
const NOT_SECRET = new Set(["", "1", "0", "true", "false", "dummy"]);

function parseEnv(file) {
  const out = [];
  if (!existsSync(file)) return out;
  let pendingKey = null;
  let pendingVal = [];
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    if (pendingKey) {
      // multi-line value (a PEM block, typically) — collect until the quote
      pendingVal.push(raw.replace(/"\s*$/, ""));
      if (/"\s*$/.test(raw)) {
        out.push([pendingKey, pendingVal.join("\n")]);
        pendingKey = null;
        pendingVal = [];
      }
      continue;
    }
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const [, key, rest] = m;
    if (rest.startsWith('"') && !/"\s*$/.test(rest.slice(1))) {
      pendingKey = key;
      pendingVal = [rest.slice(1)];
      continue;
    }
    out.push([key, rest.replace(/^["']|["']$/g, "")]);
  }
  return out;
}

/**
 * Literal secrets to strip, longest first so a password inside a URI is
 * removed as part of the URI rather than leaving a mangled fragment.
 */
export function secretsFromEnv(file = ".env") {
  const found = [];
  for (const [key, value] of parseEnv(file)) {
    // NEXT_PUBLIC_* is compiled into the browser bundle by definition, so it
    // is not a secret and redacting it only makes the log harder to read.
    if (key.startsWith("NEXT_PUBLIC_")) continue;
    if (!SECRET_KEY.test(key)) continue;
    const v = value.trim();
    if (v.length < MIN_SECRET_LEN || NOT_SECRET.has(v.toLowerCase())) continue;
    if (/^(postgres|postgresql|redis|rediss|mongodb)/i.test(v)) {
      // The whole URI, and separately the password inside it: the password is
      // often quoted on its own elsewhere in the same paste.
      found.push([v, key]);
      const pw = v.match(/^[a-z+]+:\/\/[^:/@]+:([^@]+)@/i)?.[1];
      if (pw && pw.length >= 8) found.push([pw, `${key} password`]);
      continue;
    }
    if (/BEGIN [A-Z ]*CERTIFICATE/.test(v)) continue; // public by design
    found.push([v, key]);
  }
  return found.sort((a, b) => b[0].length - a[0].length);
}

const SHAPES = [
  [/re_[A-Za-z0-9_]{20,}/g, "resend-api-key"],
  [/sk-(ant-)?[A-Za-z0-9_-]{16,}/g, "api-key"],
  [/gh[pousr]_[A-Za-z0-9]{20,}/g, "github-token"],
  [/github_pat_[A-Za-z0-9_]{20,}/g, "github-token"],
  [/AKIA[0-9A-Z]{16}/g, "aws-access-key"],
  [/AIza[0-9A-Za-z_-]{30,}/g, "google-api-key"],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/g, "slack-token"],
  [/(postgres|postgresql|redis|rediss|mongodb(\+srv)?|amqps?):\/\/[^:/\s]+:[^@\s]+@[^\s"'`)]+/g, "connection-uri"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "private-key"],
  [/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g, "jwt"],
];

/** Redact `text`, leaving a visible marker for every removal. */
export function redact(text, secrets = secretsFromEnv()) {
  let out = text;
  for (const [value, label] of secrets) {
    if (!value) continue;
    out = out.split(value).join(`[REDACTED: ${label}]`);
  }
  for (const [re, label] of SHAPES) {
    out = out.replace(re, `[REDACTED: ${label}]`);
  }
  return out;
}
