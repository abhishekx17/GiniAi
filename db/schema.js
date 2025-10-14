import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const chat_sessions = pgTable("chat_sessions", {
  id: text("id").primaryKey(),
  clerkId: text("clerkId"),
  session_name: varchar("session_name", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  session_id: text("session_id")
    .references(() => chat_sessions.id, { onDelete: "cascade" })
    .notNull(),
  role: varchar("role", { length: 10 }).notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const chatSessionsRelations = relations(chat_sessions, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(chat_sessions, {
    fields: [messages.session_id],
    references: [chat_sessions.id],
  }),
}));
