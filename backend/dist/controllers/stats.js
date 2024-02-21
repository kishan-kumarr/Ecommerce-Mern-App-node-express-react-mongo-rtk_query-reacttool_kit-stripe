import { StatusCodes } from "http-status-codes";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { Order } from "../models/order.js";
import { calculatePrecentage, getChartData, getInventories } from "../utils/features.js";
export const getDashboardStats = async (req, res, next) => {
    try {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        };
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), -1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        };
        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth?.start,
                $lte: thisMonth?.end
            }
        });
        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth?.start,
                $lte: lastMonth?.end
            }
        });
        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth?.start,
                $lte: thisMonth?.end
            }
        });
        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth?.start,
                $lte: lastMonth?.end
            }
        });
        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth?.start,
                $lte: thisMonth?.end
            }
        });
        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth?.start,
                $lte: lastMonth?.end
            }
        });
        const sixMonthsAgoOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        });
        const latestTransactionsPromise = Order.find({}).select(["orderItems", "total", "status", "discount"]).limit(4);
        // using Promise.all()
        const [thisMonthProducts, thisMonthUsers, thisMonthOrders, lastMonthProducts, lastMonthUsers, lastMonthOrders, productCount, userCount, allOrders, sixMonthsAgoOrders, categories, femaleUsersCount, latestTransactions] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            sixMonthsAgoOrdersPromise,
            Product.distinct("category"),
            User.countDocuments({ "gender": "female" }),
            latestTransactionsPromise
        ]);
        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order?.total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order?.total || 0), 0);
        const changePrecentage = {
            revenue: calculatePrecentage(thisMonthRevenue, lastMonthRevenue),
            product: calculatePrecentage(thisMonthProducts.length, lastMonthProducts.length),
            user: calculatePrecentage(thisMonthUsers.length, lastMonthUsers.length),
            order: calculatePrecentage(thisMonthOrders.length, lastMonthOrders.length)
        };
        const revenue = allOrders.reduce((total, order) => total + (order?.total || 0), 0);
        let count = {
            revenue,
            products: productCount,
            users: userCount,
            orders: allOrders.length
        };
        const orderMonthCount = new Array(6).fill(0);
        const orderMonthRevenue = new Array(6).fill(0);
        sixMonthsAgoOrders.forEach((order) => {
            const creationDate = order?.createdAt;
            const monthDiff = today.getMonth() - creationDate.getMonth();
            if (monthDiff < 6) {
                orderMonthCount[5 - monthDiff] += 1;
                orderMonthRevenue[5 - monthDiff] += order?.total;
            }
        });
        const categoriesCountPromises = categories.map(category => {
            return Product.countDocuments({ category });
        });
        const categoriesCount = await Promise.all(categoriesCountPromises);
        const categoryCount = [];
        categories.forEach((category, i) => {
            categoryCount.push({
                // calculating % percentage
                [category]: Math.round(categoriesCount[i] / productCount * 100)
            });
        });
        const userRatio = {
            male: Math?.abs(userCount - femaleUsersCount),
            female: femaleUsersCount
        };
        const modifyLatestTransactions = latestTransactions.map(order => ({
            _id: order?._id,
            quantity: order?.orderItems?.length,
            status: order?.status,
            amount: order?.total,
            discount: order?.discount
        }));
        let stats = {
            categoryCount,
            count,
            chart: {
                order: orderMonthCount,
                revenue: orderMonthRevenue
            },
            userRatio,
            latestTransactions: modifyLatestTransactions
        };
        res.status(StatusCodes.OK).json({ success: true, stats });
    }
    catch (error) {
        res.status(StatusCodes.OK).json({ success: true, message: `${error} --- while getting data for admin dashboard` });
    }
};
export const getPieCharts = async (req, res, next) => {
    try {
        const allOrderPromise = Order.find({}).select([
            "total",
            "discount",
            "subtotal",
            "tax",
            "shippingCharges",
        ]);
        const [processingOrder, shippedOrder, deliveredOrder, categories, productsCount, outOfStock, allOrders, allUsers, adminUsers, customerUsers,] = await Promise.all([
            Order.countDocuments({ status: "Processing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Delivered" }),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock: 0 }),
            allOrderPromise,
            User.find({}).select(["dob"]),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ role: "user" }),
        ]);
        const orderFullfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder,
        };
        const productCategories = await getInventories({
            categories,
            productsCount,
        });
        const stockAvailablity = {
            inStock: productsCount - outOfStock,
            outOfStock,
        };
        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);
        const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);
        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
        const marketingCost = Math.round(grossIncome * (30 / 100));
        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;
        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        };
        const usersAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter((i) => i.age >= 40).length,
        };
        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers,
        };
        const charts = {
            orderFullfillment,
            productCategories,
            stockAvailablity,
            revenueDistribution,
            usersAgeGroup,
            adminCustomer,
        };
        return res.status(StatusCodes.OK).json({ success: true, charts });
    }
    catch (error) {
        res.status(StatusCodes.OK).json({ success: true, message: `${error} --- while getting data for admin pie chart` });
    }
};
export const getBarCharts = async (req, res, next) => {
    try {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const sixMonthProductPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        const sixMonthUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        const twelveMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        const [products, users, orders] = await Promise.all([
            sixMonthProductPromise,
            sixMonthUsersPromise,
            twelveMonthOrdersPromise,
        ]);
        const productCounts = getChartData({ length: 6, today, docArr: products });
        const usersCounts = getChartData({ length: 6, today, docArr: users });
        const ordersCounts = getChartData({ length: 12, today, docArr: orders });
        const charts = {
            users: usersCounts,
            products: productCounts,
            orders: ordersCounts,
        };
        return res.status(StatusCodes.OK).json({ success: true, charts });
    }
    catch (error) {
        res.status(StatusCodes.OK).json({ success: true, message: `${error} --- while getting data for admin bar chart` });
    }
};
export const getLineCharts = async (req, res, next) => {
    try {
        const today = new Date();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        };
        const [products, users, orders] = await Promise.all([
            Product.find(baseQuery).select("createdAt"),
            User.find(baseQuery).select("createdAt"),
            Order.find(baseQuery).select(["createdAt", "discount", "total"]),
        ]);
        const productCounts = getChartData({ length: 12, today, docArr: products });
        const usersCounts = getChartData({ length: 12, today, docArr: users });
        const discount = getChartData({
            length: 12,
            today,
            docArr: orders,
            property: "discount",
        });
        const revenue = getChartData({
            length: 12,
            today,
            docArr: orders,
            property: "total",
        });
        const charts = {
            users: usersCounts,
            products: productCounts,
            discount,
            revenue,
        };
        return res.status(StatusCodes.OK).json({ success: true, charts });
    }
    catch (error) {
        res.status(StatusCodes.OK).json({ success: true, message: `${error} while getting data for admin line chart` });
    }
};
