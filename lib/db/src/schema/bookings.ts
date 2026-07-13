import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { driversTable } from "./drivers";
import { relations } from "drizzle-orm";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  driverId: integer("driver_id").references(() => driversTable.id),
  status: text("status").notNull().default("searching"), // searching | accepted | arriving | in_progress | completed | cancelled
  pickupLocation: text("pickup_location").notNull(),
  destination: text("destination").notNull(),
  notes: text("notes"),
  fareEstimate: real("fare_estimate").notNull().default(0),
  estimatedArrival: text("estimated_arrival"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const bookingsRelations = relations(bookingsTable, ({ one }) => ({
  student: one(usersTable, {
    fields: [bookingsTable.studentId],
    references: [usersTable.id],
  }),
  driver: one(driversTable, {
    fields: [bookingsTable.driverId],
    references: [driversTable.id],
  }),
}));

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
