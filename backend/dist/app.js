import express from "express";
import "dotenv/config";
import { dbConn } from "./utils/database.js";
import { errorMiddleware } from "./middlewares/error.js";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";
//* importing routes
import userRoute from "./routes/user.js";
import productRoute from "./routes/product.js";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/payment.js";
import dashboardRoute from "./routes/stats.js";
const app = express();
const PORT = process.env.PORT || 5000;
//* Stripe
const stripeKey = process.env.STRIPE_KEY || "";
export const stripe = new Stripe(stripeKey);
dbConn();
/* `app.use(express.json());` is setting up a middleware function to parse incoming requests with JSON
payloads. It allows the server to automatically parse the request body as JSON and make it available
on the `request.body` property. This is useful when working with APIs that send JSON data in the
request body. */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());
/* `app.use("/api/v1/user", userRoute);` is setting up a middleware function for the "/api/v1/user"
route. */
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);
app.use("/uploads", express.static("uploads"));
//* Error Handler
app.use(errorMiddleware);
app.listen(PORT, () => {
    console.log(`App listening on PORT: http://localhost:${PORT}`);
});
