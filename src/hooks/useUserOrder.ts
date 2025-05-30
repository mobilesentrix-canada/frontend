import axios from "axios";
import { useApiQuery, useApiMutation } from "./useApi";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleApiError = (error: any) => {
  let message = "An unexpected error occurred.";
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.response?.data?.error) {
    message = error.response.data.error;
  } else if (error.message) {
    message = error.message;
  }
  throw new Error(message);
};


export interface ProductDetail {
  product_id: string;
  product_name: string;
  quantity: number;
  price: string;
  image_url: string | null;
  display_name: string;
  sku?: string | null;
}

export interface OrderListItem {
  id: number;
  order_number: string;
  user_id: number;
  store_id: number;
  total_amount: string;
  items_count: number;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  store_name: string;
  store_id_ref: number | string;
  product_names: string[];
  product_details: ProductDetail[]; 
}

export interface OrderDetailItem {
  id: number;
  product_id: string;
  product_name: string;
  quantity: number;
  price: string;
  subtotal: string;
  created_at: string;
  image_url: string | null;
  display_name: string;
  sku?: string | null;
  current_price?: string | null;
}

export interface OrderDetail extends OrderListItem {
  items: OrderDetailItem[];
}

export interface OrderCreateItem {
  id: string | number;
  quantity: number;
  price: number;
}

export interface OrderListResponse {
  success: boolean;
  data: {
    orders: OrderListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface OrderDetailResponse {
  success: boolean;
  data: OrderDetail;
}

export interface OrderCreateResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    order_number: string;
    user_id: number;
    store_id: string;
    total_amount: string;
    status: string;
    items_count: number;
    created_at: string;
    updated_at: string;
    user_name: string;
    user_email: string;
    store_name: string;
    items: Array<{
      id: number;
      order_id: number;
      product_id: string;
      product_name: string;
      quantity: number;
      price: string;
      created_at: string;
    }>;
  };
}

export interface CreateOrderData {
  items: OrderCreateItem[];
  store_id: number;
}

export interface PlaceOrderFromCartData {
  store_id: number;
  products: Array<{
    id: string | number;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface OrderActionResponse {
  success: boolean;
  message: string;
  data: any;
}

const OrderService = {
 
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrderListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.status) queryParams.append("status", params.status);

      const response = await axiosInstance.get(
        `/orders?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

 
  getOrderById: async (id: number): Promise<OrderDetailResponse> => {
    try {
      const response = await axiosInstance.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },


  createOrder: async (data: CreateOrderData): Promise<OrderCreateResponse> => {
    try {
      const response = await axiosInstance.post("/orders", data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  placeOrderFromCart: async (
    data: PlaceOrderFromCartData
  ): Promise<OrderCreateResponse> => {
    try {
      const response = await axiosInstance.post("/orders/from-cart", data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  
  cancelOrder: async (id: number): Promise<OrderActionResponse> => {
    try {
      const response = await axiosInstance.put(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },


  deleteOrder: async (id: number): Promise<OrderActionResponse> => {
    try {
      const response = await axiosInstance.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  restoreOrderToCart: async (id: number): Promise<OrderActionResponse> => {
    try {
      const response = await axiosInstance.post(
        `/orders/${id}/restore-to-cart`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

export const useOrdersList = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const {
    data: ordersResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ["orders", params],
    queryFn: () => OrderService.getOrders(params),
    staleTime: 2 * 60 * 1000, 
  });

  const orders = ordersResponse?.data?.orders ?? [];
  const pagination = ordersResponse?.data?.pagination ?? null;

  return {
    orders,
    pagination,
    isLoading,
    error,
    refetch,
  };
};


export const useOrderDetail = (id: number | null) => {
  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ["order", id],
    queryFn: () => OrderService.getOrderById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, 
  });

  const order = orderResponse?.data ?? null;

  return {
    order,
    isLoading,
    error,
    refetch,
  };
};


export const useUserOrder = () => {

  const createOrderMutation = useApiMutation({
    mutationFn: (data: CreateOrderData) => OrderService.createOrder(data),
    invalidateQueries: [["orders"]],
    onSuccess: (data) => {
      console.log("Order created successfully:", data.data.order_number);
    },
    onError: (error) => {
      console.error("Error creating order:", error);
    },
  });

 
  const placeOrderFromCartMutation = useApiMutation({
    mutationFn: (data: PlaceOrderFromCartData) =>
      OrderService.placeOrderFromCart(data),
    invalidateQueries: [["cart"], ["orders"]], 
    onSuccess: (data) => {
      console.log(
        "Order placed from cart successfully:",
        data.data.order_number
      );
    },
    onError: (error) => {
      console.error("Error placing order from cart:", error);
    },
  });


  const cancelOrderMutation = useApiMutation({
    mutationFn: (id: number) => OrderService.cancelOrder(id),
    invalidateQueries: [["orders"]],
    onSuccess: (data) => {
      console.log("Order cancelled successfully");
    },
    onError: (error) => {
      console.error("Error cancelling order:", error);
    },
  });

  const deleteOrderMutation = useApiMutation({
    mutationFn: (id: number) => OrderService.deleteOrder(id),
    invalidateQueries: [["orders"]], 
    onSuccess: (data) => {
      console.log("Order deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting order:", error);
    },
  });

  
  const restoreOrderToCartMutation = useApiMutation({
    mutationFn: (id: number) => OrderService.restoreOrderToCart(id),
    invalidateQueries: [["cart"], ["orders"]], 
    onSuccess: (data) => {
      console.log("Order restored to cart successfully");
    },
    onError: (error) => {
      console.error("Error restoring order to cart:", error);
    },
  });

 
  const createOrderFromCartItems = (cartItems: any[], storeId: number) => {
    const orderData: CreateOrderData = {
      items: cartItems.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
        price: parseFloat(item.product.price) || 0,
      })),
      store_id: storeId,
    };

    return createOrderMutation.mutate(orderData);
  };


  const placeOrderFromCartItems = (cartItems: any[], storeId: number) => {
    const orderData: PlaceOrderFromCartData = {
      store_id: storeId,
      products: cartItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: parseFloat(item.product.price) || 0,
        quantity: item.quantity,
      })),
    };

    return placeOrderFromCartMutation.mutate(orderData);
  };

  return {

    createOrder: createOrderMutation.mutate,
    placeOrderFromCart: placeOrderFromCartMutation.mutate,
    createOrderFromCartItems,
    placeOrderFromCartItems,


    cancelOrder: cancelOrderMutation.mutate,
    deleteOrder: deleteOrderMutation.mutate,
    restoreOrderToCart: restoreOrderToCartMutation.mutate,

    
    isCreatingOrder: createOrderMutation.isPending,
    isPlacingOrderFromCart: placeOrderFromCartMutation.isPending,
    isCancellingOrder: cancelOrderMutation.isPending,
    isDeletingOrder: deleteOrderMutation.isPending,
    isRestoringOrderToCart: restoreOrderToCartMutation.isPending,

  
    createOrderError: createOrderMutation.error,
    placeOrderFromCartError: placeOrderFromCartMutation.error,
    cancelOrderError: cancelOrderMutation.error,
    deleteOrderError: deleteOrderMutation.error,
    restoreOrderToCartError: restoreOrderToCartMutation.error,

 
    createOrderData: createOrderMutation.data,
    placeOrderFromCartData: placeOrderFromCartMutation.data,
    cancelOrderData: cancelOrderMutation.data,
    deleteOrderData: deleteOrderMutation.data,
    restoreOrderToCartData: restoreOrderToCartMutation.data,

    resetCreateOrder: createOrderMutation.reset,
    resetPlaceOrderFromCart: placeOrderFromCartMutation.reset,
    resetCancelOrder: cancelOrderMutation.reset,
    resetDeleteOrder: deleteOrderMutation.reset,
    resetRestoreOrderToCart: restoreOrderToCartMutation.reset,
  };
};


export default useUserOrder;
