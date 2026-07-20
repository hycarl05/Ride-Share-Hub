import { Router, type IRouter } from "express";
import { eq, like, or, and } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { getUserFromRequest } from "./auth";

const router: IRouter = Router();

router.get("/users", async (req, res): Promise<void> => {
  const { role, search } = req.query as { role?: string; search?: string };

  let users = await db.select().from(usersTable);

  if (role) {
    users = users.filter((u) => u.role === role);
  }
  if (search) {
    const s = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        (u.studentId ?? "").toLowerCase().includes(s),
    );
  }

  const safe = users.map(({ password: _, ...u }) => u);
  res.json(safe);
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { password: _, ...safe } = user;
  res.json(safe);
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const { name, phone, studentId, profilePhoto } = req.body;
  const updates: Record<string, any> = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (studentId !== undefined) updates.studentId = studentId;
  if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { password: _, ...safe } = user;
  res.json(safe);
});

export default router;
