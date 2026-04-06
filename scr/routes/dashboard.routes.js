import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/dashboard", getDashboardStats);

export default dashboardRouter;

console.log("Dashboard is working.")