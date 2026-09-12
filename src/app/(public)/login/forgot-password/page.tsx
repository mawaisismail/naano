import { ForgotPasswordPanel } from "./ForgotPasswordPanel";

/**
 * /login/forgot-password — the page naano's "Forgot password?" link points at.
 *
 * A different shell from /login on their site too: a single centred card in
 * Plus Jakarta rather than the split screen, with the wordmark beside the mark.
 */
export const metadata = { title: "Reset your password — Naano" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordPanel />;
}
