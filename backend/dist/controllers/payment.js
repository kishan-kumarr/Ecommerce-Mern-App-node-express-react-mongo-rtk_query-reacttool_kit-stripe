import { StatusCodes } from "http-status-codes";
import ErrorHandler from "../utils/error-handler.js";
import { Coupon } from "../models/coupon.js";
import { stripe } from "../app.js";
export const createPaymentIntent = async (req, res, next) => {
    try {
        const { amount } = req?.body;
        if (!amount) {
            return next(new ErrorHandler(`Please provide amount`, StatusCodes.BAD_REQUEST));
        }
        const paymentIntent = await stripe.paymentIntents.create({ amount: Number(amount) * 100, currency: "inr" });
        return res.status(StatusCodes.CREATED).json({ success: true, clientSecret: paymentIntent.client_secret });
    }
    catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while doing payment` });
    }
};
export const createCoupon = async (req, res, next) => {
    try {
        const { code, amount } = req?.body;
        if (!code || !amount) {
            return next(new ErrorHandler(`All fields are mendatory`, StatusCodes.BAD_REQUEST));
        }
        const coupon = await Coupon.create({ code, amount });
        if (!coupon) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Coupon not created" });
        }
        res.status(StatusCodes.CREATED).json({ success: true, message: `Coupon created with code: ${code}` });
    }
    catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while creating coupon` });
    }
};
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.status(StatusCodes.OK).json({ success: true, coupons, totalCoupons: coupons.length });
    }
    catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while fetching all coupon` });
    }
};
export const getSingleCoupon = async (req, res, next) => {
    try {
        const _id = req?.params?.id;
        if (!_id) {
            return next(new ErrorHandler("Please provide coupon id", StatusCodes.NOT_FOUND));
        }
        const coupon = await Coupon.findById({ _id });
        if (!coupon) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: `Coupon not found with this id: ${_id}` });
        }
        res.status(StatusCodes.OK).json({ success: true, coupon });
    }
    catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while fetching single coupon` });
    }
};
export const getDiscount = async (req, res, next) => {
    try {
        const code = req?.query?.coupon;
        if (!code)
            return next(new ErrorHandler(`Please provide coupon code`, StatusCodes.BAD_REQUEST));
        const coupon = await Coupon.findOne({ code });
        if (!coupon) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: `Invalid coupon code` });
        }
        return res.status(StatusCodes.OK).json({ success: true, amount: coupon?.amount });
    }
    catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while getting discount on behalf of code` });
    }
};
export const deleteCoupon = async (req, res, next) => {
    try {
        const _id = req?.params?.id;
        if (!_id) {
            return next(new ErrorHandler("Please provide coupon id", StatusCodes.NOT_FOUND));
        }
        const coupon = await Coupon.findOneAndDelete({ _id });
        if (!coupon) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: `Coupon not found with this id: ${_id}` });
        }
        res.status(StatusCodes.OK).json({ success: true, message: `Coupon has been deleted with this id: ${_id}` });
    }
    catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while deleting coupon` });
    }
};
