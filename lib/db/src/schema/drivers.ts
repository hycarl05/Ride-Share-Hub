import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { relations } from "drizzle-orm";

export const driversTable = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  icNumber: text("ic_number").notNull(),
  licenseNumber: text("license_number").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  vehiclePlate: text("vehicle_plate").notNull(),
  profilePhoto: text("profile_photo"),
  vehiclePhoto: text("vehicle_photo"),
  status: text("status").notNull().default("pending"), // pending | approved | rejected | suspended
  isOnline: boolean("is_online").notNull().default(false),
  rating: real("rating").notNull().default(0),
  totalRides: integer("total_rides").notNull().default(0),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const driversRelations = relations(driversTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [driversTable.userId],
    references: [usersTable.id],
  }),
}));

export const insertDriverSchema = createInsertSchema(driversTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof driversTable.$inferSelect;
