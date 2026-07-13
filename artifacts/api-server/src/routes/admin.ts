import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, bookingsTable, usersTable, driversTable, ratingsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const allUsers = await db.select().from(usersTable);
  const allDrivers = await db.select().from(driversTable);
  const allBookings = await db.select().from(bookingsTable);

  const students = allUsers.filter((u) => u.role === "student");
  const activeDrivers = allDrivers.filter((d) => d.isOnline && d.status === "approved");
  const completedTrips = allBookings.filter((b) => b.status === "completed");
  const pendingVerifications = allDrivers.filter((d) => d.status === "pending");
  const totalRevenue = completedTrips.reduce((sum, b) => sum + b.fareEstimate, 0);

  // Recent bookings enriched
  const sorted = [...allBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentEnriched = await Promise.all(
    sorted.slice(0, 10).map(async (b) => {
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
    totalStudents: students.length,
    totalDrivers: allDrivers.length,
    activeDrivers: activeDrivers.length,
    completedTrips: completedTrips.length,
    pendingVerifications: pendingVerifications.length,
    totalRevenue,
    recentBookings: recentEnriched,
  });
});

router.get("/admin/pending-drivers", async (_req, res): Promise<void> => {
  const drivers = await db.select().from(driversTable).where(eq(driversTable.status, "pending"));

  const enriched = await Promise.all(
    drivers.map(async (d) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, d.userId));
      return { ...d, name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", studentId: user?.studentId ?? null };
    }),
  );

  res.json(enriched);
});

export default router;
