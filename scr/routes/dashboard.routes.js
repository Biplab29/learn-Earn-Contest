
import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authorizeRoles, verifyJWT } from "../middleware/checkAuthUser.js";

const dashboardRouter = express.Router();


// =====================================================
// GET DASHBOARD STATS
// বাংলা: শুধু admin dashboard data দেখতে পারবে
// English: Only admin can access dashboard stats
// =====================================================
dashboardRouter.get(
  "/dashboard",
  verifyJWT,
  authorizeRoles("admin"),
  getDashboardStats
);

export default dashboardRouter;

console.log("Dashboard route is working.");