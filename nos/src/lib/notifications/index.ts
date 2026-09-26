import { config } from "../config";
import type { Event, Registration } from "../db/schema";
import { formatLongDate, formatTime, lines } from "../format";

/**
 * Envio de confirmações.
 *
 * E-mail  → EMAIL_PROVIDER = console (padrão, só registra no terminal) | resend
 * WhatsApp → WHATSAPP_PROVIDER = none (padrão) | console | webhook
 *   "webhook" faz um POST com os dados para WHATSAPP_WEBHOOK_URL — dá para ligar
 *   em Z-API, Twilio, Make/Zapier ou na API oficial do WhatsApp sem mexer no resto do código.
 */

type Message = { to: string; subject: string; text: string; html: string };

async function sendEmail(msg: Message) {
  const provider = process.env.EMAIL_PROVIDER ?? "console";
  if (provider === "resend") {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!key || !from) throw new Error("RESEND_API_KEY / EMAIL_FROM não configurados");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [msg.to],
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        reply_to: process.env.EMAIL_REPLY_TO || undefined,
      }),
    });
    if (!res.ok) throw new Error(`Resend → ${res.status}: ${await res.text()}`);
    return;
  }
  console.info(`\n[email:console] para ${msg.to}\nassunto: ${msg.subject}\n${msg.text}\n`);
}

async function sendWhatsApp(phone: string, text: string, data: Record<string, unknown>) {
  const provider = process.env.WHATSAPP_PROVIDER ?? "none";
  if (provider === "none") return;
  if (provider === "webhook") {
    const url = process.env.WHATSAPP_WEBHOOK_URL;
    if (!url) throw new Error("WHATSAPP_WEBHOOK_URL não configurado");
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, text, ...data }),
    });
    return;
  }
  console.info(`\n[whatsapp:console] para ${phone}\n${text}\n`);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function confirmationMessage(registration: Registration, event: Event) {
  const firstName = registration.name.split(" ")[0];
  const when = `${formatLongDate(event.date)}, ${formatTime(event.time)}`;
  const where = [event.locationName, event.address].filter(Boolean).join(" — ");
  const info = lines(event.importantInfo);
  const link = `${config.siteUrl}/confirmacao/${registration.publicToken}`;

  const text = [
    `oi, ${firstName}! você está dentro 🤍`,
    ``,
    `seu lugar na nós está confirmado:`,
    `${event.title}`,
    `${when}`,
    where,
    ...(info.length ? ["", "importante:", ...info.map((i) => `• ${i}`)] : []),
    ``,
    `detalhes: ${link}`,
    ``,
    `até lá,`,
    `nós`,
  ].join("\n");

  const html = `
  <div style="background:#f3eee6;padding:40px 20px;font-family:Georgia,serif;color:#16130f">
    <div style="max-width:520px;margin:0 auto">
      <p style="font-size:44px;margin:0 0 24px;font-style:italic">nós</p>
      <p style="font-size:26px;margin:0 0 8px">você está dentro! 🤍</p>
      <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;margin:0 0 28px">
        oi, ${escapeHtml(firstName)}! seu lugar na nós está confirmado.
      </p>
      <div style="border-top:1px solid #16130f;border-bottom:1px solid #16130f;padding:20px 0;font-family:Arial,sans-serif;font-size:15px;line-height:1.7">
        <strong style="font-family:Georgia,serif;font-size:22px;font-weight:normal">${escapeHtml(event.title)}</strong><br/>
        ${escapeHtml(when)}<br/>
        ${escapeHtml(where)}
      </div>
      ${
        info.length
          ? `<ul style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;padding-left:18px">${info
              .map((i) => `<li>${escapeHtml(i)}</li>`)
              .join("")}</ul>`
          : ""
      }
      <p style="margin-top:28px"><a href="${link}" style="color:#16130f">ver detalhes do encontro →</a></p>
    </div>
  </div>`;

  return { subject: `você está dentro! 🤍 ${event.title}`, text, html };
}

/** Envia a confirmação por todos os canais configurados. Falhas não quebram a inscrição. */
export async function sendRegistrationConfirmation(registration: Registration, event: Event) {
  const msg = confirmationMessage(registration, event);
  const results = await Promise.allSettled([
    sendEmail({ to: registration.email, ...msg }),
    sendWhatsApp(registration.phone, msg.text, {
      registrationId: registration.id,
      event: event.title,
      name: registration.name,
    }),
  ]);
  for (const r of results) if (r.status === "rejected") console.error("[notificação]", r.reason);
  return results[0].status === "fulfilled";
}
