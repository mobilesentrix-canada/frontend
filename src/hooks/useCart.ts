import axios from "axios";
import { useApiQuery, useApiMutation } from "./useApi";

export interface Product {
  id: number;
  name: string;
  price: number;
  sku: string;
  manufacturer: string;
  model: string;
  category_ids: number[];
  weight: string;
  status: number;
  description: string;
  badges: string;
  image?: string;
  stock?: number;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    sku: string;
    manufacturer: string;
    model: string;
    category_ids: number[];
    weight: string;
    status: number;
    description: string;
    badges: string;
    image: string;
  };
  store: any;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItem[];
    total: string;
    count: number;
    store: any;
  };
}

export interface AddToCartData {
  product_id: string | number;
  quantity: number;
}

export interface UpdateCartData {
  quantity: number;
}

export interface WishlistResponse {
  success: boolean;
  data: any;
}

export interface AddToWishlistData {
  product_id: string | number;
}

export interface OrderItem {
  product_id: string | number;
  quantity: number;
  price: number;
}

export interface CreateOrderData {
  items: OrderItem[];
  store_id: number;
}

export interface PlaceOrderFromCartData {
  store_id: number;
  products: any;
}

export interface OrderResponse {
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

const ProductService = {
  getProduct: async (id: string | number): Promise<ProductResponse> => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

const CartService = {
  getCart: async (): Promise<CartResponse> => {
    try {
      const response = await axiosInstance.get("/user/cart");
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  addToCart: async (
    data: AddToCartData
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post("/user/cart", data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateCartItem: async (
    id: number,
    data: UpdateCartData
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.put(`/user/cart/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  removeCartItem: async (
    id: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.delete(`/user/cart/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.delete("/user/cart");
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

const WishlistService = {
  getWishlist: async (): Promise<WishlistResponse> => {
    try {
      const response = await axiosInstance.get("/user/wishlist");
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  addToWishlist: async (
    data: AddToWishlistData
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post("/user/wishlist", data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  removeFromWishlist: async (
    productId: string | number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.delete(
        `/user/wishlist/${productId}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

const OrderService = {
  createOrder: async (data: CreateOrderData): Promise<OrderResponse> => {
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
  ): Promise<OrderResponse> => {
    try {
      const response = await axiosInstance.post("/orders/from-cart", data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

export const useProduct = (id: string | number | null) => {
  return useApiQuery({
    queryKey: ["product", id],
    queryFn: () => ProductService.getProduct(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

export const useCart = () => {
  const {
    data: cartResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ["cart"],
    queryFn: () => CartService.getCart(),
  });
  console.log(cartResponse);
  const store = cartResponse?.data?.store ?? null;
  const cartItems = cartResponse?.data?.items ?? [];
  const total = cartResponse?.data?.total ?? "0.00";
  const count = cartResponse?.data?.count ?? 0;

  const addToCartMutation = useApiMutation({
    mutationFn: (data: AddToCartData) => CartService.addToCart(data),
    invalidateQueries: [["cart"]],
    onSuccess: () => {
      console.log("Product added to cart successfully");
    },
    onError: (error) => {
      console.error("Error adding to cart:", error);
    },
  });

  const updateCartMutation = useApiMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCartData }) =>
      CartService.updateCartItem(id, data),
    invalidateQueries: [["cart"]],
    onSuccess: () => {
      console.log("Cart item updated successfully");
    },
  });

  const removeCartItemMutation = useApiMutation({
    mutationFn: (id: number) => CartService.removeCartItem(id),
    invalidateQueries: [["cart"]],
    onSuccess: () => {
      console.log("Cart item removed successfully");
    },
  });

  const clearCartMutation = useApiMutation({
    mutationFn: () => CartService.clearCart(),
    invalidateQueries: [["cart"]],
    onSuccess: () => {
      console.log("Cart cleared successfully");
    },
  });

  return {
    store,
    cartItems,
    total,
    count,
    isLoading,
    error,
    refetch,
    addToCart: addToCartMutation.mutate,
    updateCartItem: (id: number, data: UpdateCartData) =>
      updateCartMutation.mutate({ id, data }),
    removeCartItem: removeCartItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartMutation.isPending,
    isRemovingFromCart: removeCartItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
    addToCartError: addToCartMutation.error,
    updateCartError: updateCartMutation.error,
    removeCartError: removeCartItemMutation.error,
    clearCartError: clearCartMutation.error,
  };
};

export const useWishlist = () => {
  const {
    data: wishlistResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ["wishlist"],
    queryFn: () => WishlistService.getWishlist(),
  });

  const wishlistItems = wishlistResponse?.data ?? [];

  const addToWishlistMutation = useApiMutation({
    mutationFn: (data: AddToWishlistData) =>
      WishlistService.addToWishlist(data),
    invalidateQueries: [["wishlist"]],
    onSuccess: () => {
      console.log("Product added to wishlist successfully");
    },
    onError: (error) => {
      console.error("Error adding to wishlist:", error);
    },
  });

  const removeFromWishlistMutation = useApiMutation({
    mutationFn: (productId: string | number) =>
      WishlistService.removeFromWishlist(productId),
    invalidateQueries: [["wishlist"]],
    onSuccess: () => {
      console.log("Product removed from wishlist successfully");
    },
  });

  const isInWishlist = (productId: string | number) => {
    return wishlistItems.some(
      (item) => item.product_id === productId?.toString()
    );
  };

  return {
    wishlistItems,
    isLoading,
    error,
    refetch,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
    addToWishlistError: addToWishlistMutation.error,
    removeFromWishlistError: removeFromWishlistMutation.error,
    isInWishlist,
  };
};

export const useOrders = () => {
  const createOrderMutation = useApiMutation({
    mutationFn: (data: CreateOrderData) => OrderService.createOrder(data),
    onSuccess: () => {
      console.log("Order created successfully");
    },
    onError: (error) => {
      console.error("Error creating order:", error);
    },
  });

  const placeOrderFromCartMutation = useApiMutation({
    mutationFn: (data: PlaceOrderFromCartData) =>
      OrderService.placeOrderFromCart(data),
    invalidateQueries: [["cart"]],
    onSuccess: () => {
      console.log("Order placed from cart successfully");
    },
    onError: (error) => {
      console.error("Error placing order from cart:", error);
    },
  });

  return {
    createOrder: createOrderMutation.mutate,
    placeOrderFromCart: placeOrderFromCartMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    isPlacingOrderFromCart: placeOrderFromCartMutation.isPending,
    createOrderError: createOrderMutation.error,
    placeOrderFromCartError: placeOrderFromCartMutation.error,
  };
};
