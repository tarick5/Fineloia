import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";

let resendClient: Resend | null = null;

export function getResendClient() {
  if (resendClient) {
    return resendClient;
  }

  const env = getServerEnv();
  resendClient = new Resend(env.RESEND_API_KEY);

  return resendClient;
}
