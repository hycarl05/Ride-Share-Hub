import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ratingsTable, driversTable, usersTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/ratings", async (req, res): Promise<void> => {
  const { bookingId, driverId, rating, comment } = req.body;
  if (!bookingId || !driverId || !rating) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be between 1 and 5" });
    return;
  }

  // Get student from auth (simplified: use a placeholder for demo)
  const studentId = 1; // Should come from auth in production

  const [ratingRow] = await db.insert(ratingsTable).values({
    bookingId: parseInt(String(bookingId), 10),
    driverId: parseInt(String(driverId), 10),
    studentId,
    rating: parseInt(String(rating), 10),
    comment: comment ?? null,
  }).returning();

  // Recalculate driver average rating
  const allRatings = await db.select().from(ratingsTable).where(eq(ratingsTable.driverId, parseInt(String(driverId), 10)));
  const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
  await db.update(driversTable).set({ rating: Math.round(avg * 10) / 10 }).where(eq(driversTable.id, parseInt(String(driverId), 10)));

  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, studentId));
  res.status(201).json({ ...ratingRow, studentName: student?.name ?? "" });
});

router.get("/ratings/driver/:driverId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.driverId) ? req.params.driverId[0] : req.params.driverId;
  const driverId = parseInt(raw, 10);

  const ratings = await db.select().from(ratingsTable).where(eq(ratingsTable.driverId, driverId));

  const enriched = await Promise.all(
    ratings.map(async (r) => {
      const [student] = await db.select().from(usersTable).where(eq(usersTable.id, r.studentId));
      return { ...r, studentName: student?.name ?? "" };
    }),
  );

  // Sort newest first
  enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(enriched);
});

export default router;
