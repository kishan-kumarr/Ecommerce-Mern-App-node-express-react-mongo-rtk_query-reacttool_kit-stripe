import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/error-handler.js";
import { StatusCodes } from "http-status-codes";

export const errorMiddleware = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
   
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
   
    return res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}