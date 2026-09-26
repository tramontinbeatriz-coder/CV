/**
 * Dados de EXEMPLO para ver o site funcionando. Tudo fica marcado como
 * "conteúdo de exemplo" (is_sample) e pode ser editado ou apagado no painel.
 *
 *   npm run db:seed            → cria admin inicial + exemplos (se o banco estiver vazio)
 *   npm run db:seed -- --reset → apaga TODOS os exemplos e recria
 */
import "./load-env";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import sharp from "sharp";

const reset = process.argv.includes("--reset");

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 17 de outubro (exemplo enviado pela nós) se ainda estiver no futuro; senão, daqui a 3 semanas. */
function exampleDate() {
  const year = new Date().getFullYear();
  const target = `${year}-10-17`;
  return target > addDays(3) ? target : addDays(21);
}

async function main() {
  const { db } = await import("../src/lib/db");
  const s = await import("../src/lib/db/schema");

  // ---- acesso ao painel -------------------------------------------------
  const admins = await db.select().from(s.adminUsers);
  if (admins.length === 0) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (email && password) {
      await db.insert(s.adminUsers).values({
        email: email.toLowerCase(),
        name: "admin",
        passwordHash: await bcrypt.hash(password, 12),
      });
      console.log(`✓ acesso ao painel criado: ${email}`);
    } else {
      console.warn("! defina ADMIN_EMAIL e ADMIN_PASSWORD no .env para criar o acesso ao painel");
    }
  }

  if (reset) {
    const sampleEvents = await db.select({ id: s.events.id }).from(s.events).where(eq(s.events.isSample, true));
    const ids = sampleEvents.map((e) => e.id);
    if (ids.length) {
      await db.delete(s.registrations).where(inArray(s.registrations.eventId, ids));
      await db.delete(s.photos).where(inArray(s.photos.eventId, ids));
      await db.delete(s.waitlistEntries).where(inArray(s.waitlistEntries.eventId, ids));
      await db.delete(s.events).where(inArray(s.events.id, ids));
    }
    const samplePast = await db.select({ id: s.pastEvents.id }).from(s.pastEvents).where(eq(s.pastEvents.isSample, true));
    if (samplePast.length) {
      await db.delete(s.photos).where(inArray(s.photos.pastEventId, samplePast.map((p) => p.id)));
      await db.delete(s.pastEvents).where(inArray(s.pastEvents.id, samplePast.map((p) => p.id)));
    }
    console.log("✓ exemplos antigos removidos");
  } else {
    const existing = await db.select({ id: s.events.id }).from(s.events).limit(1);
    if (existing.length) {
      console.log("• o banco já tem eventos — exemplos não foram criados (use --reset para recriar)");
      return;
    }
  }

  const sample = (n: number) => `/samples/amostra-${String(n).padStart(2, "0")}.jpg`;
  const dims = async (n: number) => {
    const meta = await sharp(`public${sample(n)}`).metadata();
    return { width: meta.width ?? 1200, height: meta.height ?? 1500 };
  };

  // ---- próximos encontros ----------------------------------------------
  const [defesa, cafe, ceramica] = await db
    .insert(s.events)
    .values([
      {
        title: "defesa pessoal com fran",
        slug: "defesa-pessoal-com-fran",
        tagline: "uma manhã para aprender, se movimentar e sair um pouquinho mais confiante.",
        summary: "[texto de exemplo] uma aula prática e acolhedora para aprender o básico de defesa pessoal em grupo.",
        description:
          "[texto de exemplo — edite no painel]\n\ndescreva aqui como vai ser o encontro: o que vai acontecer, quem conduz, para quem é e o clima da manhã.\n\nnão precisa experiência prévia e dá para vir sozinha.",
        date: exampleDate(),
        time: "09:00",
        duration: "[exemplo] 2 horas",
        locationName: "Alameda Bom Fim",
        address: "[placeholder] endereço completo — editar no painel",
        city: "Porto Alegre",
        priceCents: 9000,
        totalSpots: 20,
        spotsTaken: 0,
        status: "auto",
        published: true,
        isSample: true,
        coverImage: sample(2),
        coverAlt: "foto de exemplo",
        included: "[exemplo] aula com a instrutora\n[exemplo] água e frutinhas\n[exemplo] um brinde surpresa da nós",
        importantInfo: "[exemplo] venha com roupa confortável\n[exemplo] chegue 10 minutos antes\n[exemplo] traga sua garrafinha",
      },
      {
        title: "café & conversa",
        slug: "cafe-e-conversa",
        tagline: "[exemplo] uma tarde sem pressa, com café bom e gente nova.",
        summary: "[evento fictício de exemplo] mostra como aparece um encontro com poucas vagas restantes.",
        description: "[evento fictício de exemplo — apague ou edite no painel]",
        date: addDays(42),
        time: "16:00",
        duration: "[exemplo] 2h30",
        locationName: "[placeholder] local",
        address: "[placeholder] endereço",
        city: "Porto Alegre",
        priceCents: 6500,
        totalSpots: 12,
        spotsTaken: 0,
        status: "auto",
        published: true,
        isSample: true,
        coverImage: sample(6),
        coverAlt: "foto de exemplo",
        included: "[exemplo] café e comidinhas",
        importantInfo: "[exemplo] informação importante",
      },
      {
        title: "ateliê de cerâmica",
        slug: "atelie-de-ceramica",
        tagline: "[exemplo] mãos no barro, cabeça leve.",
        summary: "[evento fictício de exemplo] mostra como aparece um encontro esgotado, com lista de espera.",
        description: "[evento fictício de exemplo — apague ou edite no painel]",
        date: addDays(63),
        time: "10:00",
        duration: "[exemplo] 3h",
        locationName: "[placeholder] local",
        address: "[placeholder] endereço",
        city: "Porto Alegre",
        priceCents: 18000,
        totalSpots: 8,
        spotsTaken: 0,
        status: "auto",
        published: true,
        isSample: true,
        coverImage: sample(12),
        coverAlt: "foto de exemplo",
        included: "[exemplo] materiais e queima das peças",
        importantInfo: "[exemplo] informação importante",
      },
      {
        title: "rascunho — wine experience",
        slug: "rascunho-wine-experience",
        summary: "[exemplo] um rascunho: não aparece no site até ser publicado.",
        date: addDays(90),
        time: "19:30",
        priceCents: 15000,
        totalSpots: 16,
        status: "auto",
        published: false,
        isSample: true,
        coverImage: sample(9),
      },
    ])
    .returning();

  // inscrições pagas de exemplo para mostrar "últimas vagas" e "esgotado"
  const fakeRegs = (eventId: string, count: number, amount: number) =>
    Array.from({ length: count }, (_, i) => ({
      eventId,
      publicToken: randomBytes(18).toString("base64url"),
      name: `pessoa de exemplo ${String(i + 1).padStart(2, "0")}`,
      email: `exemplo${i + 1}@example.com`,
      phone: "51 00000-0000",
      city: "Porto Alegre",
      discoverySource: "instagram",
      acceptedTermsAt: new Date().toISOString(),
      paymentStatus: "paid" as const,
      paymentProvider: "exemplo",
      amountCents: amount,
      paidAt: new Date().toISOString(),
      notes: "inscrição de exemplo",
    }));
  await db.insert(s.registrations).values([...fakeRegs(cafe.id, 9, 6500), ...fakeRegs(ceramica.id, 8, 18000)]);
  await db.update(s.events).set({ spotsTaken: 9 }).where(eq(s.events.id, cafe.id));
  await db.update(s.events).set({ spotsTaken: 8 }).where(eq(s.events.id, ceramica.id));

  // ---- eventos passados (galeria) ---------------------------------------
  const [pDefesa, pWine] = await db
    .insert(s.pastEvents)
    .values([
      {
        title: "defesa pessoal",
        slug: "defesa-pessoal-agosto",
        date: `${new Date().getFullYear()}-08-15`,
        location: "Alameda Bom Fim",
        description: "[texto de exemplo] conte em uma ou duas frases como foi o encontro.",
        isSample: true,
      },
      {
        title: "wine experience",
        slug: "wine-experience-agosto",
        date: `${new Date().getFullYear()}-08-29`,
        location: "[placeholder] local",
        description: "[texto de exemplo] conte em uma ou duas frases como foi o encontro.",
        isSample: true,
      },
    ])
    .returning();

  const photoRows = [];
  const setA = [1, 3, 4, 5, 7, 8, 10];
  const setB = [11, 13, 14, 2, 6, 9, 12];
  for (const [i, n] of setA.entries()) {
    photoRows.push({ url: sample(n), alt: "foto de exemplo", ...(await dims(n)), pastEventId: pDefesa.id, featured: i < 4, sortOrder: i });
  }
  for (const [i, n] of setB.entries()) {
    photoRows.push({ url: sample(n), alt: "foto de exemplo", ...(await dims(n)), pastEventId: pWine.id, featured: i < 3, sortOrder: i });
  }
  await db.insert(s.photos).values(photoRows);

  console.log(`✓ exemplos criados: 4 encontros (${defesa.slug}, ...) e 2 galerias`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
