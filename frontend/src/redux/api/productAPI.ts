import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AllProductResponse, CategoriesResponse, DeleteProductRequest, MessageResponse, NewProductRequest, ProductResponse, SearchProductsRequest, SearchProductsResponse, UpdateProductRequest } from "../../types/api-types";

export const productAPI = createApi({ 
    reducerPath: "productApi", 
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/product/`,
    }),
    endpoints: ( builder ) => ({
        latestProducts: builder.query<ProductResponse, string>({ query: () => "get-latest-product"}),
        allProducts: builder.query<AllProductResponse, string>({ query: (id) => `get-admin-products/?id=${id}`}),
        categories: builder.query<CategoriesResponse, string>({ query: () => `categories`}),
        searchProducts: builder.query<SearchProductsResponse, SearchProductsRequest>({ query: ({price, search, category, sort, page}) => { 
                let base = `get-filtered-product?search=${search}&page=${page}`;

                if(price) base = base + `&price=${price}`;
                if(category) base = base + `&category=${category}`;
                if(sort) base = base + `&sort=${sort}`;

                return base;
            }
        }),
        createProduct: builder.mutation<MessageResponse, NewProductRequest>({
            query: ( { id, formData } ) => ({
                url: `new?id=${id}`,
                method: "POST",
                body: formData
            }),
        }),
        getSingleProduct: builder.query<ProductResponse, {productId: string, adminId: string}>({ query: ({productId, adminId}) => `get-single-product/${productId}?id=${adminId}`}),
        updateProduct: builder.mutation<MessageResponse, UpdateProductRequest>({
            query: ( { productId, adminId, formData } ) => ({
                url: `update-product/${productId}?id=${adminId}`,
                method: "PUT",
                body: formData
            }),
        }),
        deleteProduct: builder.mutation<MessageResponse, DeleteProductRequest>({
            query: ( { adminId, productId } ) => ({
                url: `delete-product/${productId}?id=${adminId}`,
                method: "DELETE"
            }),
        }),
    }),
});


export const { 
     useLatestProductsQuery,
     useAllProductsQuery,
     useCategoriesQuery,
     useSearchProductsQuery,
     useCreateProductMutation,
     useGetSingleProductQuery,
     useUpdateProductMutation,
     useDeleteProductMutation,
} = productAPI;
