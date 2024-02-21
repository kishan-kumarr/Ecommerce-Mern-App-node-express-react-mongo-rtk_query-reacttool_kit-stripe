import express from "express";
import { allUsers, deleteUser, getUser, newUser } from "../controllers/user.js";
import { adminAuth } from "../middlewares/auth.js";
const route = express.Router();
//*  http://localhost:8000/api/v1/user/new -- creating new user
route.post("/new", newUser);
//*  http://localhost:8000/api/v1/user/all-users -- getting all users
route.get("/all-users", adminAuth, allUsers);
//*  http://localhost:8000/api/v1/user/user-id -- creating get single user
route.get("/:id", getUser);
//*  http://localhost:8000/api/v1/user/user-id -- delete new user
route.delete("/:id", adminAuth, deleteUser);
export default route;
