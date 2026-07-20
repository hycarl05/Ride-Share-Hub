import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { driversTable } from "./drivers";
import { bookingsTable } from "./bookings";
import { relations } from "drizzle-orm";

export const ratingsTable = pgTable("ratings", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookingsTable.id),
  driverId: integer("driver_id").notNull().references(() => driversTable.id),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ratingsRelations = relations(ratingsTable, ({ one }) => ({
  booking: one(bookingsTable, {
    fields: [ratingsTable.bookingId],
    references: [bookingsTable.id],
  }),
  driver: one(driversTable, {
    fields: [ratingsTable.driverId],
    references: [driversTable.id],
  }),
  student: one(usersTable, {
    fields: [ratingsTable.studentId],
    references: [usersTable.id],
  }),
}));

export const insertRatingSchema = createInsertSchema(ratingsTable).omit({ id: true, createdAt: true });
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratingsTable.$inferSelect;
