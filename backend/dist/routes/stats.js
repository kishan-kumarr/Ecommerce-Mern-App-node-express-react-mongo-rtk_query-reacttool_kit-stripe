import express from "express";
import { adminAuth } from "../middlewares/auth.js";
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/stats.js";
const route = express.Router();
route.get("/stats", adminAuth, getDashboardStats);
route.get("/pie", adminAuth, getPieCharts);
route.get("/bar", adminAuth, getBarCharts);
route.get("/line", adminAuth, getLineCharts);
export default route;
