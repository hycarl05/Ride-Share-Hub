import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, bookingsTable, usersTable, driversTable, ratingsTable } from "@workspace/db";
import { getUserFromRequest } from "./auth";

const router: IRouter = Router();

async function enrichBooking(booking: typeof bookingsTable.$inferSelect) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, booking.studentId));
  const { password: _p, ...safeStudent } = student ?? { password: "" };

  let driver = null;
  if (booking.driverId) {
    const [d] = await db.select().from(driversTable).where(eq(driversTable.id, booking.driverId));
    if (d) {
      const [dUser] = await db.select().from(usersTable).where(eq(usersTable.id, d.userId));
      driver = { ...d, name: dUser?.name ?? "", email: dUser?.email ?? "", phone: dUser?.phone ?? "", studentId: dUser?.studentId ?? null };
    }
  }

  const [rating] = await db.select().from(ratingsTable).where(eq(ratingsTable.bookingId, booking.id));

  return {
    ...booking,
    student: safeStudent,
    driver,
    rating: rating ?? null,
  };
}

router.get("/bookings", async (req, res): Promise<void> => {
  const { status, driverId, studentId } = req.query as { status?: string; driverId?: string; studentId?: string };

  let all = await db.select().from(bookingsTable);

  if (status) all = all.filter((b) => b.status === status);
  if (driverId) all = all.filter((b) => b.driverId === parseInt(driverId, 10));
  if (studentId) all = all.filter((b) => b.studentId === parseInt(studentId, 10));

  // Sort newest first
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const enriched = await Promise.all(all.map(enrichBooking));
  res.json(enriched);
});

router.post("/bookings", async (req, res): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { pickupLocation, destination, notes, fareEstimate } = req.body;
  if (!pickupLocation || !destination) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [booking] = await db.insert(bookingsTable).values({
    studentId: user.id,
    pickupLocation,
    destination,
    notes: notes ?? null,
    fareEstimate: fareEstimate ?? 0,
    status: "searching",
    driverId: null,
    estimatedArrival: null,
  }).returning();

  const enriched = await enrichBooking(booking);
  res.status(201).json(enriched);
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const enriched = await enrichBooking(booking);
  res.json(enriched);
});

router.patch("/bookings/:id/status", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const { status } = req.body;
  const allowed = ["arriving", "in_progress", "completed"];
  if (!allowed.includes(status)) {
    res.status(400).json({ error: "Invalid status transition" });
    return;
  }

  const [booking] = await db.update(bookingsTable).set({ status }).where(eq(bookingsTable.id, id)).returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  // Update driver stats if completed
  if (status === "completed" && booking.driverId) {
    const [driver] = await db.select().from(driversTable).where(eq(driversTable.id, booking.driverId));
    if (driver) {
      await db.update(driversTable).set({ totalRides: driver.totalRides + 1 }).where(eq(driversTable.id, booking.driverId));
    }
  }

  const enriched = await enrichBooking(booking);
  res.json(enriched);
});

router.patch("/bookings/:id/cancel", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [booking] = await db.update(bookingsTable).set({ status: "cancelled" }).where(eq(bookingsTable.id, id)).returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const enriched = await enrichBooking(booking);
  res.json(enriched);
});

router.patch("/bookings/:id/accept", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const { driverId, estimatedArrival } = req.body;
  if (!driverId) {
    res.status(400).json({ error: "driverId required" });
    return;
  }

  const [booking] = await db.update(bookingsTable).set({
    status: "accepted",
    driverId: parseInt(String(driverId), 10),
    estimatedArrival: estimatedArrival ?? null,
  }).where(eq(bookingsTable.id, id)).returning();

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const enriched = await enrichBooking(booking);
  res.json(enriched);
});

router.patch("/bookings/:id/reject", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  // Reset back to searching so another driver can pick it up
  const [booking] = await db.update(bookingsTable).set({ status: "searching", driverId: null }).where(eq(bookingsTable.id, id)).returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const enriched = await enrichBooking(booking);
  res.json(enriched);
});

export default router;
