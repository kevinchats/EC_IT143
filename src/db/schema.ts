import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const expenseCategories = [
  "utilities",
  "maintenance",
  "insurance",
  "rates",
  "cleaning",
  "other",
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];

export const rooms = sqliteTable("rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const students = sqliteTable(
  "students",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roomId: integer("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "restrict" }),
    studentRef: text("student_ref").notNull(),
    name: text("name").notNull(),
    monthlyRentCents: integer("monthly_rent_cents").notNull(),
    leaseStart: text("lease_start").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [uniqueIndex("students_student_ref_unique").on(t.studentRef)],
);

export const payments = sqliteTable(
  "payments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "restrict" }),
    amountCents: integer("amount_cents").notNull(),
    paymentDate: text("payment_date").notNull(),
    gmailMessageId: text("gmail_message_id"),
    subject: text("subject"),
    rawPreview: text("raw_preview"),
    source: text("source").notNull().default("gmail"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    uniqueIndex("payments_gmail_message_id_unique").on(t.gmailMessageId),
  ],
);

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  expenseDate: text("expense_date").notNull(),
  amountCents: integer("amount_cents").notNull(),
  category: text("category").notNull().$type<ExpenseCategory>(),
  description: text("description").notNull(),
  roomId: integer("room_id").references(() => rooms.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const gmailSyncState = sqliteTable("gmail_sync_state", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lastSyncAt: text("last_sync_at"),
  lastError: text("last_error"),
  lastProcessedCount: integer("last_processed_count").default(0),
  lastInsertedCount: integer("last_inserted_count").default(0),
  lastSkippedCount: integer("last_skipped_count").default(0),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  students: many(students),
  expenses: many(expenses),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  room: one(rooms, { fields: [students.roomId], references: [rooms.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  room: one(rooms, { fields: [expenses.roomId], references: [rooms.id] }),
}));
