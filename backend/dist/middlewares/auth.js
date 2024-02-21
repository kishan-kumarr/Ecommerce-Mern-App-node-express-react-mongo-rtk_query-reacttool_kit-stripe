import ErrorHandler from "../utils/error-handler.js";
import { StatusCodes } from "http-status-codes";
import { User } from "../models/user.js";
export const adminAuth = async (req, res, next) => {
    const _id = req.query?.id;
    if (!_id) {
        return next(new ErrorHandler(`Please provide admin id`, StatusCodes.BAD_REQUEST));
    }
    const user = await User.findById({ _id });
    if (!user) {
        return next(new ErrorHandler(`Invailid id`, StatusCodes.NOT_FOUND));
    }
    if (user?.role !== "admin") {
        return next(new ErrorHandler(`Unauthorized user`, StatusCodes.UNAUTHORIZED));
    }
    next();
};
