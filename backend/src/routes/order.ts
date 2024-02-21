import express from "express";
import { allOrders, createOrder, deleteOrder, getSingleOrder, myOrders, processOrder } from "../controllers/order.js";
import { adminAuth } from "../middlewares/auth.js";

const route = express.Router();

route.post("/new", createOrder);
route.get("/my-orders", myOrders);
route.get("/all-orders", adminAuth, allOrders);
route.get("/:id", getSingleOrder);
route.put("/:id", adminAuth, processOrder);
route.delete("/:id", adminAuth, deleteOrder)

export default route;