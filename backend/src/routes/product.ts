import express from "express";
import { deleteProduct, getAdminProducts, getCategories, getFilteredProduct, getLatestProducts, getSingleProduct, newProduct, updateProduct } from "../controllers/product.js";
import { adminAuth } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
const route = express.Router();

//*  http://localhost:8000/api/v1/product/new -- creating new product
route.post("/new", adminAuth, singleUpload, newProduct);

//*  http://localhost:8000/api/v1/product/update-product/product-id -- updating product
route.put("/update-product/:id", adminAuth, singleUpload, updateProduct);

//*  http://localhost:8000/api/v1/product/get-admin-product -- getting admin products
route.get("/get-admin-products", adminAuth, getAdminProducts);

//*  http://localhost:8000/api/v1/product/delete-product/product-id -- deleting product
route.delete("/delete-product/:id", adminAuth, deleteProduct); 

//*  http://localhost:8000/api/v1/get-single-product/product-id -- getting single product
route.get("/get-single-product/:id", getSingleProduct);

//*  http://localhost:8000/api/v1/product/get-latest-product -- getting latest product
route.get("/get-latest-product", getLatestProducts);

//*  http://localhost:8000/api/v1/product/categories -- getting product categories
route.get("/categories", getCategories);

route.get("/get-filtered-product", getFilteredProduct); 

export default route;