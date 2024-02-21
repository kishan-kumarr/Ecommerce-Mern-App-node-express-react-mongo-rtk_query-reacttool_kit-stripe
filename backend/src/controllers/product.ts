import { StatusCodes } from "http-status-codes"
import { Product } from "../models/product.js"
import { NextFunction, Request, Response } from "express"
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js"
import ErrorHandler from "../utils/error-handler.js"
import { rm } from "fs" // rm use for remove file from server

import {faker} from "@faker-js/faker";


export const newProduct = async (req: Request<{}, {}, NewProductRequestBody>, res: Response, next: NextFunction) => {
    try {
        const { name, price, category, stock} = req.body;
        const photo = req.file;

        if(!name || !price || !category || !stock || !photo){
            return next( new ErrorHandler("All fields are mendatory", StatusCodes.BAD_REQUEST));
        }

        // removing existing photo

        const product = await Product.create({ name, price, category: category.toLowerCase(), stock, photo: photo?.path});

        if(!product){
            return next( new ErrorHandler("Product not creating please check", StatusCodes.BAD_REQUEST));
        }

        res.status(StatusCodes.CREATED).json({ success: true, message: "New Product created successfully"});

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} --- while creating product`})
    }
}

export const updateProduct = async ( req: Request<{id: string}, {}, NewProductRequestBody>, res: Response, next: NextFunction) => {
    try {
         const { name, category, stock, price } = req.body;
         const photo = req.file;
         const _id = req.params?.id;

        let product = await Product.findById({_id});

        if(!product){
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: `Product not found with thid id: ${_id}`})
        }

        if(name) product.name = name;
        if(category) product.category = category.toLowerCase();
        if(stock) product.stock = stock;
        if(price) product.price = price;
        
        if(photo) {
            rm(product?.photo, () => {
                // delete existing photo
            })
            product.photo = photo?.path;
        }

        await product.save();

        res.status(StatusCodes.OK).json({ success: true, message: "Product has been updated successfully"});

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} --- while updating product`})
    }
}

export const getLatestProducts = async ( req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await Product.find({}).sort({createdAt: -1}).limit(5);
        res.status(StatusCodes.OK).json({ success: true, message: "Latest Product list", products, totalProduct: products.length});
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} --- while getting all product`})
    }
}

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Product.distinct("category");
        res.status(StatusCodes.OK).json({ success: true, categories});
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} --- while getting all category`}) 
    }
}

export const getAdminProducts = async ( req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await Product.find({}).sort({createdAt: -1});
        res.status(StatusCodes.OK).json({ success: true, products});
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} --- while getting all product`})
    }
}



export const getSingleProduct = async ( req: Request, res: Response, next: NextFunction) => {
    try {
        const _id = req.params?.id;

        const product = await Product.findById({_id});

        if(!product) return res.status(StatusCodes.NOT_FOUND).json({sucess: false, message: `Product not found with this ${_id}`});

        res.status(StatusCodes.OK).json({ success: true, product});

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} --- while getting single product`})
    }
}


export const deleteProduct = async ( req: Request, res: Response, next: NextFunction) => {
    try {
        const _id = req.params?.id;

        const product = await Product.findById({_id});

        if(!product) return res.status(StatusCodes.NOT_FOUND).json({sucess: false, message: `Product not found with this id: ${_id}`});

        await Product.findOneAndDelete({_id});
                
        rm(product?.photo, () => {
            // delete existing photo 
        })
          
        res.status(StatusCodes.OK).json({ success: true, message: `Product has been deleted with id: ${_id}`});

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `${error} --- while deleting product`})
    }
}


export const getFilteredProduct = async (req: Request<{}, {}, {}, SearchRequestQuery>, res: Response, next: NextFunction) => {
      const { search, sort, category, price } = req.query;
  
      const page = Number(req.query.page) || 1;
      // 1,2,3,4,5,6,7,8
      // 9,10,11,12,13,14,15,16
      // 17,18,19,20,21,22,23,24
      const limit = Number(process.env.PRODUCT_PER_PAGE) || 9;
      const skip = (page - 1) * limit;
  
      const baseQuery: BaseQuery = {};
  
      if (search)
        baseQuery.name = { 
          $regex: search,
          $options: "i",
        };
        
  
      if (price)
        baseQuery.price = {
          $lte: Number(price),
        };
  
      if (category) baseQuery.category = category;
  
      const productsPromise = Product.find(baseQuery)
        .sort(sort ? { price: sort === "asc" ? 1 : -1 } : {createdAt: -1})
        .limit(limit)
        .skip(skip);
  
      const [products, filteredOnlyProduct] = await Promise.all([
        productsPromise,
        Product.find(baseQuery),
      ]);
  
      const totalPage = Math.ceil(filteredOnlyProduct.length / limit);
  
      return res.status(StatusCodes.OK).json({
        success: true,
        products,
        totalPage
       });
    };


// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\\a6b4338c-7083-47b7-8a70-04598ab80036.jpg",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }

//   await Product.create(products);

//   console.log({ succecss: true });
// };
//GENERATING GIVEN NUMBER OF PRODUCTS
// generateRandomProducts(100); 

// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(2);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };
//DELETING GIVEN NUMBER OF PRODUCTS
// deleteRandomsProducts()