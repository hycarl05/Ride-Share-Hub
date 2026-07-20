import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import driversRouter from "./drivers";
import bookingsRouter from "./bookings";
import ratingsRouter from "./ratings";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import fareRouter from "./fare";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(driversRouter);
router.use(bookingsRouter);
router.use(ratingsRouter);
router.use(dashboardRouter);
router.use(adminRouter);
router.use(fareRouter);

export default router;
