import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { createHash } from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "upsi_salt_2024").digest("hex");
}

function makeToken(userId: number, role: string): string {
  const payload = `${userId}:${role}:${Date.now()}`;
  return Buffer.from(payload).toString("base64");
}

function parseToken(token: string): { userId: number; role: string } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, role] = decoded.split(":");
    if (!userId || !role) return null;
    return { userId: parseInt(userId, 10), role };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: any): Promise<typeof usersTable.$inferSelect | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const parsed = parseToken(token);
  if (!parsed) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.userId));
  return user ?? null;
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password, phone, studentId } = req.body;
  if (!name || !email || !password || !phone) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashPassword(password),
    phone,
    role: "student",
    studentId: studentId ?? null,
  }).returning();

  const token = makeToken(user.id, user.role);
  const { password: _, ...safeUser } = user;
  res.status(201).json({ user: safeUser, token });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Missing email or password" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.password !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = makeToken(user.id, user.role);
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ message: "Logged out" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

export default router;
