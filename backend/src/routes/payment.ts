import express from "express";
import { createCoupon, createPaymentIntent, deleteCoupon, getAllCoupons, getDiscount, getSingleCoupon } from "../controllers/payment.js";
import { adminAuth } from "../middlewares/auth.js";
const route = express.Router();

route.post("/payment/create", createPaymentIntent);

route.post("/coupon/new", adminAuth, createCoupon);
route.get("/coupon/get-all-coupons", adminAuth, getAllCoupons);
route.get("/coupon/discount", getDiscount);
route.get("/coupon/:id", getSingleCoupon);
route.delete("/coupon/:id", adminAuth, deleteCoupon); 

export default route;    