import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AllOrdersResponse,
  MessageResponse,
  NewOrderRequest,
  OrderDetailsResponse,
  UpdateOrderRequest,
} from "../../types/api-types";


export const orderAPI = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    // baseUrl: `${import.meta.env.BASE_URL}/api/v1/order/`,
     baseUrl: `http://localhost:8000/api/v1/order/`,
  }),
  endpoints: (builder) => ({
    newOrder: builder.mutation<MessageResponse, NewOrderRequest>({
      query: (order) => ({
        url: "new",
        method: "POST",
        body: order,
      }),
    }),
    myOrders: builder.query<AllOrdersResponse, string>({
      query: (userId) => `my-orders?id=${userId}`,
    }),
    allOrders: builder.query<AllOrdersResponse, string>({
      query: (id) => `all-orders?id=${id}`,
    }),
    orderDetails: builder.query<OrderDetailsResponse, string>({
      query: (id) => id,
    }),
    modifyOrder: builder.mutation<MessageResponse, UpdateOrderRequest>({
      query: ({ orderId, adminId }) => ({
        url: `${orderId}?id=${adminId}`,
        method: "PUT",
      }),
    }),
    deleteOrder: builder.mutation<MessageResponse, UpdateOrderRequest>({
      query: ({ orderId, adminId }) => ({
        url: `${orderId}?id=${adminId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useNewOrderMutation,
  useMyOrdersQuery,
  useAllOrdersQuery,
  useOrderDetailsQuery,
  useModifyOrderMutation,
  useDeleteOrderMutation,
} = orderAPI;
