import { StatusCodes } from "http-status-codes";
export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    return res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
