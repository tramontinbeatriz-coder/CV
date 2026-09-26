"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { RegistrationError, confirmRegistration, getRegistrationByToken, joinWaitlist, setPaymentStatus, startRegistration } from "@/lib/registrations";
import { isTestMode } from "@/lib/payments";

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const phoneRegex = /^[\d\s()+-]{10,20}$/;

const registrationSchema = z.object({
  name: z.string().trim().min(3, "conta pra gente seu nome completo").max(120),
  email: z.string().trim().email("confere o e-mail?").max(160),
  phone: z.string().trim().regex(phoneRegex, "coloca o whatsapp com DDD"),
  instagram: z.string().trim().max(60).optional(),
  city: z.string().trim().min(2, "de qual cidade você é?").max(80),
  discoverySource: z.string().trim().max(80).optional(),
  terms: z.literal("on", { error: "é preciso aceitar para continuar" }),
});

const waitlistSchema = registrationSchema.pick({ name: true, email: true, phone: true, instagram: true });

function collect(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && !k.startsWith("$")) values[k] = v;
  return values;
}

function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    out[key] ??= issue.message;
  }
  return out;
}

export async function registerAction(slug: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = collect(formData);
  if (values.website) return { ok: false, error: "algo deu errado." }; // honeypot anti-spam

  const parsed = registrationSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error), values, error: "falta pouquinho — confere os campos marcados." };
  }

  let target: string;
  try {
    const result = await startRegistration(slug, {
      ...parsed.data,
      instagram: parsed.data.instagram?.replace(/^@/, ""),
    });
    target = result.redirectTo;
  } catch (err) {
    if (err instanceof RegistrationError) return { ok: false, error: err.message, values };
    console.error(err);
    return { ok: false, error: "não conseguimos concluir agora. tenta de novo em instantes?", values };
  }
  redirect(target);
}

export async function waitlistAction(slug: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = collect(formData);
  if (values.website) return { ok: false, error: "algo deu errado." };
  const parsed = waitlistSchema.safeParse(values);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error), values };
  try {
    await joinWaitlist(slug, parsed.data);
    return { ok: true };
  } catch (err) {
    if (err instanceof RegistrationError) return { ok: false, error: err.message, values };
    throw err;
  }
}

/** Botões da página de checkout de TESTE (só funcionam com PAYMENT_PROVIDER=mock). */
export async function mockPayAction(token: string, outcome: "approve" | "decline") {
  if (!isTestMode()) throw new Error("checkout de teste desativado");
  const row = await getRegistrationByToken(token);
  if (!row) redirect("/");
  if (outcome === "approve") {
    await confirmRegistration(row.registration.id, { reference: `mock_pago_${Date.now()}` });
    redirect(`/confirmacao/${token}`);
  }
  await setPaymentStatus(row.registration.id, "failed");
  redirect(`/confirmacao/${token}?falhou=1`);
}
