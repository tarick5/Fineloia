import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_STARTER_MONTHLY_PRICE_ID: z.string().min(1),
  STRIPE_STARTER_ANNUAL_PRICE_ID: z.string().min(1),
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().min(1),
  STRIPE_PRO_ANNUAL_PRICE_ID: z.string().min(1),
  STRIPE_ENTERPRISE_MONTHLY_PRICE_ID: z.string().min(1),
  STRIPE_ENTERPRISE_ANNUAL_PRICE_ID: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EXCHANGE_RATE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

let serverEnvCache: z.infer<typeof serverSchema> | null = null;

export function getServerEnv() {
  if (serverEnvCache) {
    return serverEnvCache;
  }

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server env: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  }

  serverEnvCache = parsed.data;
  return parsed.data;
}

export function getPublicEnv() {
  const parsed = publicSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error("Invalid public env configuration");
  }

  return parsed.data;
}
