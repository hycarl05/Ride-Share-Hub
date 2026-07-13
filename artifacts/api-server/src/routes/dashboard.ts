import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, bookingsTable, usersTable, driversTable, ratingsTable } from "@workspace/db";
import { getUserFromRequest } from "./auth";

const router: IRouter = Router();

router.get("/dashboard/student", async (req, res): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const allBookings = await db.select().from(bookingsTable).where(eq(bookingsTable.studentId, user.id));

  const completed = allBookings.filter((b) => b.status === "completed");
  const cancelled = allBookings.filter((b) => b.status === "cancelled");
  const totalSpent = completed.reduce((sum, b) => sum + b.fareEstimate, 0);

  const activeStatuses = ["searching", "accepted", "arriving", "in_progress"];
  const activeBookingRaw = allBookings.find((b) => activeStatuses.includes(b.status)) ?? null;

  // Enrich active booking
  let activeBooking = null;
  if (activeBookingRaw) {
    const [student] = await db.select().from(usersTable).where(eq(usersTable.id, activeBookingRaw.studentId));
    const { password: _p, ...safeStudent } = student ?? { password: "" };
    let driver = null;
    if (activeBookingRaw.driverId) {
      const [d] = await db.select().from(driversTable).where(eq(driversTable.id, activeBookingRaw.driverId));
      if (d) {
        const [dUser] = await db.select().from(usersTable).where(eq(usersTable.id, d.userId));
        driver = { ...d, name: dUser?.name ?? "", email: dUser?.email ?? "", phone: dUser?.phone ?? "", studentId: dUser?.studentId ?? null };
      }
    }
    activeBooking = { ...activeBookingRaw, student: safeStudent, driver, rating: null };
  }

  // Recent bookings (last 5, sorted newest first)
  const sorted = [...allBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recent = sorted.slice(0, 5);
  const recentEnriched = await Promise.all(
    recent.map(async (b) => {
      const [student] = await db.select().from(usersTable).where(eq(usersTable.id, b.studentId));
      const { password: _p, ...safeStudent } = student ?? { password: "" };
      let driver = null;
      if (b.driverId) {
        const [d] = await db.select().from(driversTable).where(eq(driversTable.id, b.driverId));
        if (d) {
          const [dUser] = await db.select().from(usersTable).where(eq(usersTable.id, d.userId));
          driver = { ...d, name: dUser?.name ?? "", email: dUser?.email ?? "", phone: dUser?.phone ?? "", studentId: dUser?.studentId ?? null };
        }
      }
      const [rating] = await db.select().from(ratingsTable).where(eq(ratingsTable.bookingId, b.id));
      return { ...b, student: safeStudent, driver, rating: rating ?? null };
    }),
  );

  res.json({
    totalRides: allBookings.length,
    completedRides: completed.length,
    cancelledRides: cancelled.length,
    totalSpent,
    activeBooking,
    recentBookings: recentEnriched,
  });
});

router.get("/dashboard/driver", async (req, res): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [driver] = await db.select().from(driversTable).where(eq(driversTable.userId, user.id));
  if (!driver) {
    res.status(404).json({ error: "Driver profile not found" });
    return;
  }

  const allBookings = await db.select().from(bookingsTable).where(eq(bookingsTable.driverId, driver.id));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayBookings = allBookings.filter((b) => new Date(b.createdAt) >= today && b.status === "completed");
  const todayEarnings = todayBookings.reduce((sum, b) => sum + b.fareEstimate, 0);
  const totalEarnings = allBookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.fareEstimate, 0);

  // Pending requests (searching bookings)
  const pendingRaw = await db.select().from(bookingsTable).where(eq(bookingsTable.status, "searching"));
  const pendingEnriched = await Promise.all(
    pendingRaw.slice(0, 5).map(async (b) => {
      const [student] = await db.select().from(usersTable).where(eq(usersTable.id, b.studentId));
      const { password: _p, ...safeStudent } = student ?? { password: "" };
      return { ...b, student: safeStudent, driver: null, rating: null };
    }),
  );

  // Recent trips
  const sorted = [...allBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentEnriched = await Promise.all(
    sorted.slice(0, 5).map(async (b) => {
      const [student] = await db.select().from(usersTable).where(eq(usersTable.id, b.studentId));
      const { password: _p, ...safeStudent } = student ?? { password: "" };
      const [rating] = await db.select().from(ratingsTable).where(eq(ratingsTable.bookingId, b.id));
      return { ...b, student: safeStudent, driver: { ...driver, name: user.name, email: user.email, phone: user.phone, studentId: user.studentId ?? null }, rating: rating ?? null };
    }),
  );

  res.json({
    todayEarnings,
    todayTrips: todayBookings.length,
    totalEarnings,
    totalTrips: driver.totalRides,
    rating: driver.rating,
    isOnline: driver.isOnline,
    pendingRequests: pendingEnriched,
    recentTrips: recentEnriched,
  });
});

export default router;
