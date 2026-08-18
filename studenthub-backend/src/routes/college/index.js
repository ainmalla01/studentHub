import { Router } from "express";

import dashboardRoutes from "./dashboard.route.js";
import studentsRoutes from "./students.route.js";
import projectsRoutes from "./projects.route.js";
import eventsRoutes from "./events.route.js";
import competitionsRoutes from "./competitions.route.js";
import communitiesRoutes from "./communities.route.js";
import noticesRoutes from "./notices.route.js";
import reportsRoutes from "./reports.route.js";
import settingsRoutes from "./settings.route.js";

const router = Router();

router.use("/dashboard", dashboardRoutes);
router.use("/students", studentsRoutes);
router.use("/projects", projectsRoutes);
router.use("/events", eventsRoutes);
router.use("/competitions", competitionsRoutes);
router.use("/communities", communitiesRoutes);
router.use("/notices", noticesRoutes);
router.use("/reports", reportsRoutes);
router.use("/settings", settingsRoutes);

export default router;