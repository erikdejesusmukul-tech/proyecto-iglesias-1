import { relations, sql } from "drizzle-orm";
import {
  pgEnum,
  pgSchema,
  pgTable,
  check,
  date,
  index,
  jsonb,
  numeric,
  text,
  timestamp,
  time,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/** Supabase-managed table. It is referenced by profiles but excluded from Drizzle migrations. */
const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const userRoleEnum = pgEnum("user_role", [
  "superadmin",
  "admin",
  "pastor",
  "secretario",
  "tesorero",
  "coordinador",
  "miembro",
  "usuario_web",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "pending_review",
  "verified",
  "rejected",
]);

export const memberStatusEnum = pgEnum("member_status", ["activo", "inactivo"]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "presente",
  "ausente",
  "justificado",
]);

export const transactionTypeEnum = pgEnum("transaction_type", ["ingreso", "egreso"]);

export const churches = pgTable(
  "churches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    legalRegistrationNumber: varchar("legal_registration_number", { length: 255 }),
    verificationStatus: verificationStatusEnum("verification_status")
      .notNull()
      .default("unverified"),
    verificationDocumentUrl: text("verification_document_url"),
    logoUrl: text("logo_url"),
    contactEmail: varchar("contact_email", { length: 320 }),
    contactPhone: text("contact_phone"),
    address: text("address"),
    // Existing editorial catalog fields are retained until their data has a
    // separately planned destination; omitting them would make Drizzle drop them.
    short: text("short").notNull(),
    tagline: text("tagline").notNull(),
    image: text("image").notNull(),
    founded: text("founded").notNull(),
    mapQuery: text("map_query").notNull(),
    history: text("history").array().notNull().default([]),
    capillas: jsonb("capillas").$type<{ name: string; note: string }[]>().notNull().default([]),
    horarios: jsonb("horarios").$type<{ day: string; hours: string }[]>().notNull().default([]),
    contacto: jsonb("contacto")
      .$type<{ address: string; phone: string; email: string }>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    objetos: jsonb("objetos").$type<{ name: string; note: string }[]>().notNull().default([]),
    eventos: jsonb("eventos").$type<{ name: string; note: string }[]>().notNull().default([]),
    libros: jsonb("libros").$type<{ title: string; note: string }[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    unique("churches_slug_key").on(table.slug),
    index("churches_name_idx").on(table.name),
    check("churches_capillas_array", sql`jsonb_typeof(${table.capillas}) = 'array'`),
    check("churches_horarios_array", sql`jsonb_typeof(${table.horarios}) = 'array'`),
    check("churches_contacto_object", sql`jsonb_typeof(${table.contacto}) = 'object'`),
    check("churches_objetos_array", sql`jsonb_typeof(${table.objetos}) = 'array'`),
    check("churches_eventos_array", sql`jsonb_typeof(${table.eventos}) = 'array'`),
    check("churches_libros_array", sql`jsonb_typeof(${table.libros}) = 'array'`),
  ],
).enableRLS();

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  churchId: uuid("church_id").references(() => churches.id, { onDelete: "set null" }),
  role: userRoleEnum("role").notNull().default("usuario_web"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
}).enableRLS();

export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    email: varchar("email"),
    phone: varchar("phone"),
    status: memberStatusEnum("status").notNull().default("activo"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("members_church_id_idx").on(table.churchId),
    index("members_church_status_idx").on(table.churchId, table.status),
  ],
).enableRLS();

export const ministries = pgTable(
  "ministries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    name: varchar("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [index("ministries_church_id_idx").on(table.churchId)],
).enableRLS();

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    name: varchar("name").notNull(),
    description: text("description"),
    eventDate: date("event_date", { mode: "string" }).notNull(),
    eventTime: time("event_time").notNull(),
    ministryId: uuid("ministry_id").references(() => ministries.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("events_church_date_idx").on(table.churchId, table.eventDate),
    index("events_ministry_id_idx").on(table.ministryId),
  ],
).enableRLS();

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    status: attendanceStatusEnum("status").notNull().default("presente"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    unique("attendance_event_member_unique").on(table.eventId, table.memberId),
    index("attendance_church_event_idx").on(table.churchId, table.eventId),
  ],
).enableRLS();

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    type: transactionTypeEnum("type").notNull(),
    category: varchar("category", { length: 120 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    transactionDate: date("transaction_date", { mode: "string" }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("transactions_church_date_idx").on(table.churchId, table.transactionDate),
    check("transactions_amount_positive", sql`${table.amount} > 0`),
  ],
).enableRLS();

export const churchesRelations = relations(churches, ({ many }) => ({
  profiles: many(profiles),
  members: many(members),
  ministries: many(ministries),
  events: many(events),
  attendance: many(attendance),
  transactions: many(transactions),
}));

export const ministriesRelations = relations(ministries, ({ one }) => ({
  church: one(churches, {
    fields: [ministries.churchId],
    references: [churches.id],
  }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  church: one(churches, {
    fields: [events.churchId],
    references: [churches.id],
  }),
  ministry: one(ministries, {
    fields: [events.ministryId],
    references: [ministries.id],
  }),
  attendance: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  church: one(churches, {
    fields: [attendance.churchId],
    references: [churches.id],
  }),
  event: one(events, {
    fields: [attendance.eventId],
    references: [events.id],
  }),
  member: one(members, {
    fields: [attendance.memberId],
    references: [members.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  church: one(churches, {
    fields: [transactions.churchId],
    references: [churches.id],
  }),
}));

export const membersRelations = relations(members, ({ one }) => ({
  church: one(churches, {
    fields: [members.churchId],
    references: [churches.id],
  }),
  attendance: many(attendance),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  church: one(churches, {
    fields: [profiles.churchId],
    references: [churches.id],
  }),
  authUser: one(authUsers, {
    fields: [profiles.id],
    references: [authUsers.id],
  }),
}));

export const authUsersRelations = relations(authUsers, ({ one }) => ({
  profile: one(profiles, {
    fields: [authUsers.id],
    references: [profiles.id],
  }),
}));
