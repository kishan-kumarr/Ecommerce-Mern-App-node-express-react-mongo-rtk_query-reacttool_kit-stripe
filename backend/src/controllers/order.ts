import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Order } from "../models/order.js";
import { NewOrderRequestBody, OrderItemType } from "../types/types.js";
import ErrorHandler from "../utils/error-handler.js";
import { Product } from "../models/product.js";

export const createOrder = async ( req: Request<{}, {}, NewOrderRequestBody>, res: Response, next: NextFunction) => {
    try {
        const {shippingInfo, orderItems, user, subtotal, total, tax, shippingCharges, discount} = req.body;

        if(!shippingInfo || !orderItems || !user || !subtotal || !total || !tax){
            return next( new ErrorHandler("All fields are mendatory", StatusCodes.BAD_REQUEST) );
        }

        const order = await Order.create({
            shippingInfo, 
            orderItems,
            user,
            subtotal,
            total,
            tax,
            shippingCharges,
            discount
        });


        // updating product stock after order created
        orderItems.map(async (item: OrderItemType) => {
            const product = await Product.findById({_id: item?.productId});
            if(!product) return next(new ErrorHandler(`Product not found with this id: ${item?.productId}`, StatusCodes.NOT_FOUND))
            product.stock = product?.stock - item?.quantity;

            await product.save();
        })

        res.status(StatusCodes.CREATED).json({ success: true, message: "Order placed successfully"});

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while creating new order`});
    }
}


export const myOrders = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req?.query?.id;
        if(!userId) return next(new ErrorHandler(`Please provide user id`, StatusCodes.BAD_REQUEST));

        const orders = await Order.find({user: userId}).populate("user", ["name", "email"]);

        res.status(StatusCodes.OK).json({success: true, orders});

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while fetching my orders`});
    }
}


export const allOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find({}).populate("user", ["name", "photo", "_id"]).sort({createdAt: -1});
        res.status(StatusCodes.OK).json({success: true, orders, totalOrders: orders?.length});
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while fetching all orders`});
    }
}

export const getSingleOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _id = req.params.id;

        if(!_id){
            return next( new ErrorHandler(`Please provide order id`, StatusCodes.BAD_REQUEST));
        }

        const order = await Order.findById({_id}).populate("user", ["name", "email"]);

        if(!order){
            res.status(StatusCodes.NOT_FOUND).json( { success: true, message: `Order not found with this id: ${_id}`});
        }

        res.status(StatusCodes.OK).json({success: true, order});

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while fetching single orders`});
    }
}


export const processOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _id = req.params.id;

        if(!_id){
            return next( new ErrorHandler(`Please provide order id`, StatusCodes.BAD_REQUEST));
        }

        const order = await Order.findById({_id});

        if(!order){
            return next( new ErrorHandler(`Order not found with this id: ${_id}`, StatusCodes.NOT_FOUND));
        }

        switch(order?.status){
            case "Processing":
            order.status = "Shipped"
            break;

            case "Shipped":
            order.status = "Delivered"
            break;

            default:
            order.status = "Delivered";
            break;
        }


        await order?.save();

        res.status(StatusCodes.OK).json({success: true, message: "Order Processed Successfully"})

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while processing order --- updating status of order`});
    }
}


export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _id = req?.params?.id;

        if(!_id){
            return next( new ErrorHandler(`Please provide order id`, StatusCodes.BAD_REQUEST));
        }

        const order = await Order.findOneAndDelete({ _id });

        if(!order){
            return next( new ErrorHandler(`Order not found with this id: ${_id}`, StatusCodes.NOT_FOUND)); 
        }

        res.status(StatusCodes.OK).json( {success: true, message: `Order has been deleted of this id: ${_id}`});
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while deleting order`});
    }
}