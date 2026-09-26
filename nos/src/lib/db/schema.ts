import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index, uniqueIndex } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`);

const updatedAt = () =>
  text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`);

/**
 * Status escolhido no painel.
 * - auto: o site decide sozinho (abertas / últimas vagas / esgotado) pelas vagas
 * - open, last_spots, sold_out, closed: força o status
 * O status exibido é calculado em src/lib/events.ts (effectiveStatus).
 */
export const EVENT_STATUSES = ["auto", "open", "last_spots", "sold_out", "closed"] as const;
export type EventStatusSetting = (typeof EVENT_STATUSES)[number];

export const events = sqliteTable(
  "events",
  {
    id: id(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    tagline: text("tagline"), // frase curta de destaque ("uma manhã para aprender...")
    summary: text("summary"), // descrição curta dos cards
    description: text("description"), // texto completo (parágrafos separados por linha em branco)
    date: text("date").notNull(), // YYYY-MM-DD (horário de Porto Alegre)
    time: text("time").notNull(), // HH:MM
    duration: text("duration"), // texto livre: "2h", "das 9h às 11h30"
    locationName: text("location_name"),
    address: text("address"),
    city: text("city").default("Porto Alegre"),
    mapsUrl: text("maps_url"),
    priceCents: integer("price_cents").notNull().default(0),
    totalSpots: integer("total_spots").notNull().default(0),
    spotsTaken: integer("spots_taken").notNull().default(0), // inscrições pagas (atualizado automaticamente)
    status: text("status", { enum: EVENT_STATUSES }).notNull().default("auto"),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    isSample: integer("is_sample", { mode: "boolean" }).notNull().default(false),
    coverImage: text("cover_image"),
    coverAlt: text("cover_alt"),
    included: text("included"), // um item por linha
    importantInfo: text("important_info"), // um item por linha
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("events_slug_idx").on(t.slug), index("events_date_idx").on(t.date)],
);

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "cancelled", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const registrations = sqliteTable(
  "registrations",
  {
    id: id(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    publicToken: text("public_token").notNull(), // usado na URL da confirmação (não adivinhável)
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    instagram: text("instagram"),
    city: text("city"),
    discoverySource: text("discovery_source"),
    acceptedTermsAt: text("accepted_terms_at").notNull(),
    paymentStatus: text("payment_status", { enum: PAYMENT_STATUSES }).notNull().default("pending"),
    paymentProvider: text("payment_provider"),
    providerReference: text("provider_reference"), // id da sessão/preferência/pagamento no provedor
    checkoutUrl: text("checkout_url"),
    amountCents: integer("amount_cents").notNull().default(0),
    holdExpiresAt: text("hold_expires_at"), // vaga reservada até (enquanto o pagamento está pendente)
    paidAt: text("paid_at"),
    confirmationSentAt: text("confirmation_sent_at"),
    overbooked: integer("overbooked", { mode: "boolean" }).notNull().default(false),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("registrations_event_idx").on(t.eventId),
    uniqueIndex("registrations_token_idx").on(t.publicToken),
  ],
);

/** Lista de espera: estrutura pronta, preenchida quando o evento esgota. */
export const waitlistEntries = sqliteTable(
  "waitlist_entries",
  {
    id: id(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    instagram: text("instagram"),
    notifiedAt: text("notified_at"),
    createdAt: createdAt(),
  },
  (t) => [index("waitlist_event_idx").on(t.eventId)],
);

export const pastEvents = sqliteTable("past_events", {
  id: id(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  date: text("date").notNull(), // YYYY-MM-DD (exibido como "agosto 2026")
  location: text("location"),
  description: text("description"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  isSample: integer("is_sample", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const photos = sqliteTable(
  "photos",
  {
    id: id(),
    url: text("url").notNull(),
    alt: text("alt"),
    width: integer("width"),
    height: integer("height"),
    pastEventId: text("past_event_id").references(() => pastEvents.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => events.id, { onDelete: "cascade" }),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false), // aparece em "nós em fotos"
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("photos_past_idx").on(t.pastEventId), index("photos_event_idx").on(t.eventId)],
);

/** Textos e informações institucionais editáveis (chave → valor). */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: updatedAt(),
});

export const adminUsers = sqliteTable("admin_users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
});

/** Log dos avisos (webhooks) dos provedores de pagamento — útil para conferir e para idempotência. */
export const paymentEvents = sqliteTable("payment_events", {
  id: id(),
  provider: text("provider").notNull(),
  registrationId: text("registration_id"),
  type: text("type"),
  payload: text("payload"),
  createdAt: createdAt(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Registration = typeof registrations.$inferSelect;
export type PastEvent = typeof pastEvents.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;
