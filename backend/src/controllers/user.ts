import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import { StatusCodes } from "http-status-codes";
import ErrorHandler from "../utils/error-handler.js";

export const newUser = async(req: Request<{}, {}, NewUserRequestBody >, res: Response, next: NextFunction) => {
    try {
        const {_id, name, email, gender, dob, photo} = req.body;

        if(!_id || !name || !email || !photo) { 
            return next(new ErrorHandler("All fields are mendotory", StatusCodes.BAD_REQUEST));
        }

        let user = await User.findById({_id});
        if(user) return res.status(StatusCodes.OK).json({success: true, message: `Welcome ${user.name}`});

        if(!dob || !gender){
            return next(new ErrorHandler("Please select gender and dob", StatusCodes.BAD_REQUEST));
        }

        user = await User.create({_id, name, email, gender, dob: new Date(dob), photo});

        return res.status(StatusCodes.CREATED).json({success: true, message: `Welcome ${user.name}`});

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while creating User`});
    }
}


export const allUsers = async(req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
    try {
            const users = await User.find({});
            res.status(StatusCodes.OK).json({success: true, message: 'All users list', users, totalUsers: users.length})
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while fetching all User`});
    }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _id = req.params?.id;

        const user = await User.findById({_id});

        if(!user){
            return res.status(StatusCodes.NOT_FOUND).json({success: false, message: `User not found with this id: ${_id}`});
        }

        res.status(StatusCodes.OK).json({success: true, user});

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while fetching single User`});
    }
}


export const deleteUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
        
        const _id = req.params.id;

        const user = await User.findById({_id});

        if(!user){
            return res.status(StatusCodes.NOT_FOUND).json({success: false, message: `User not found with this id: ${_id}`});
        }

        await User.deleteOne({_id});

        res.status(StatusCodes.OK).json({message: `User got deleted who has id: ${_id}`});

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} -- while deleting User`});
    }
}