import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, driversTable, usersTable } from "@workspace/db";
import { getUserFromRequest } from "./auth";

const router: IRouter = Router();

async function getDriverWithUser(driverId: number) {
  const [driver] = await db.select().from(driversTable).where(eq(driversTable.id, driverId));
  if (!driver) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, driver.userId));
  return {
    ...driver,
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    studentId: user?.studentId ?? null,
  };
}

router.get("/drivers", async (req, res): Promise<void> => {
  const { status, isOnline } = req.query as { status?: string; isOnline?: string };

  let drivers = await db.select().from(driversTable);

  if (status) {
    drivers = drivers.filter((d) => d.status === status);
  }
  if (isOnline !== undefined) {
    const online = isOnline === "true";
    drivers = drivers.filter((d) => d.isOnline === online);
  }

  const enriched = await Promise.all(
    drivers.map(async (d) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, d.userId));
      return { ...d, name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", studentId: user?.studentId ?? null };
    }),
  );

  res.json(enriched);
});

router.post("/drivers/register", async (req, res): Promise<void> => {
  const currentUser = await getUserFromRequest(req);
  if (!currentUser) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { icNumber, licenseNumber, vehicleType, vehiclePlate, profilePhoto, vehiclePhoto } = req.body;
  if (!icNumber || !licenseNumber || !vehicleType || !vehiclePlate) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [driver] = await db.insert(driversTable).values({
    userId: currentUser.id,
    icNumber,
    licenseNumber,
    vehicleType,
    vehiclePlate,
    profilePhoto: profilePhoto ?? null,
    vehiclePhoto: vehiclePhoto ?? null,
    status: "pending",
    isOnline: false,
    rating: 0,
    totalRides: 0,
  }).returning();

  // Update user role to driver
  await db.update(usersTable).set({ role: "driver" }).where(eq(usersTable.id, currentUser.id));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, currentUser.id));
  res.status(201).json({ ...driver, name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", studentId: user?.studentId ?? null });
});

router.get("/drivers/available", async (_req, res): Promise<void> => {
  const drivers = await db.select().from(driversTable).where(and(eq(driversTable.status, "approved"), eq(driversTable.isOnline, true)));

  const enriched = await Promise.all(
    drivers.map(async (d) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, d.userId));
      return { ...d, name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", studentId: user?.studentId ?? null };
    }),
  );

  res.json(enriched);
});

router.get("/drivers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const driver = await getDriverWithUser(id);
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.json(driver);
});

router.patch("/drivers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const { icNumber, licenseNumber, vehicleType, vehiclePlate, profilePhoto, vehiclePhoto } = req.body;
  const updates: Record<string, any> = {};
  if (icNumber) updates.icNumber = icNumber;
  if (licenseNumber) updates.licenseNumber = licenseNumber;
  if (vehicleType) updates.vehicleType = vehicleType;
  if (vehiclePlate) updates.vehiclePlate = vehiclePlate;
  if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;
  if (vehiclePhoto !== undefined) updates.vehiclePhoto = vehiclePhoto;

  const [driver] = await db.update(driversTable).set(updates).where(eq(driversTable.id, id)).returning();
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  const result = await getDriverWithUser(driver.id);
  res.json(result);
});

router.patch("/drivers/:id/toggle-online", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [existing] = await db.select().from(driversTable).where(eq(driversTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  if (existing.status !== "approved") {
    res.status(403).json({ error: "Driver must be approved before going online" });
    return;
  }

  const { isOnline } = req.body;
  const [driver] = await db.update(driversTable).set({ isOnline: Boolean(isOnline) }).where(eq(driversTable.id, id)).returning();
  const result = await getDriverWithUser(driver.id);
  res.json(result);
});

router.patch("/drivers/:id/approve", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [driver] = await db.update(driversTable).set({ status: "approved", rejectionReason: null }).where(eq(driversTable.id, id)).returning();
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  const result = await getDriverWithUser(driver.id);
  res.json(result);
});

router.patch("/drivers/:id/reject", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const { reason } = req.body;
  const [driver] = await db.update(driversTable).set({ status: "rejected", rejectionReason: reason ?? null }).where(eq(driversTable.id, id)).returning();
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  const result = await getDriverWithUser(driver.id);
  res.json(result);
});

router.patch("/drivers/:id/suspend", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [driver] = await db.update(driversTable).set({ status: "suspended", isOnline: false }).where(eq(driversTable.id, id)).returning();
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  const result = await getDriverWithUser(driver.id);
  res.json(result);
});

export default router;
