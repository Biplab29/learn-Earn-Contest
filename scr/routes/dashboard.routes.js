
import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authorizeRoles, verifyJWT } from "../middleware/checkAuthUser.js";

const dashboardRouter = express.Router();

// Only admin can access dashboard stats
// =====================================================
dashboardRouter.get(
  "/dashboard",
  verifyJWT,
  authorizeRoles("admin"),
  getDashboardStats
);

export default dashboardRouter;

console.log("Dashboard route is working.");
