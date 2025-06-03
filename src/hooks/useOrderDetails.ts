import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

// Extended interfaces for order details
export interface OrderDetailProduct {
  id?: number;
  product_id: number;
  product_name: string;
  display_name?: string;
  quantity: number;
  price: string;
  subtotal?: string;
  image_url?: string;
  category?: string;
  brand?: string;
  description?: string;
  sku?: string;
  current_price?: string;
  created_at?: string;
}

export interface OrderShippingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderDetail {
  id: number;
  order_number: string;
  user_id: number;
  store_id: number | string;
  total_amount: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  items_count: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  store_name: string;
  store_id_ref?: number;
  store_address?: string;
  store_phone?: string;
  product_names?: string[];
  product_details?: OrderDetailProduct[];
  items?: OrderDetailProduct[]; // Backend returns 'items' array
  shipping_address?: OrderShippingAddress;
  notes?: string;
  estimated_delivery?: string;
  subtotal?: string;
  tax_amount?: string;
  shipping_fee?: string;
  discount_amount?: string;
  payment_method?: string;
  payment_status?: string;
  tracking_number?: string;
  calculated_total?: string;
  user_joined_date?: string;
}

export interface OrderDetailResponse {
  success: boolean;
  data: OrderDetail;
  message?: string;
}

export interface UpdateOrderStatusData {
  status: "approved" | "rejected";
  notes?: string;
}

export interface UseOrderDetailReturn {
  order: OrderDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  updateStatus: (
    status: "approved" | "rejected",
    notes?: string
  ) => Promise<void>;
  isUpdatingStatus: boolean;
}

export interface UseUserOrderDetailReturn {
  order: OrderDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  cancelOrder: (orderId: number) => Promise<void>;
  deleteOrder: (orderId: number) => Promise<void>;
  isCancellingOrder: boolean;
  isDeletingOrder: boolean;
}

// Axios instance with interceptors
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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const handleApiError = (error: any): never => {
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

// API Service
const OrderDetailService = {
  // Admin endpoint - can see any order
  getAdminOrderDetail: async (
    orderId: string
  ): Promise<OrderDetailResponse> => {
    try {
      const response = await axiosInstance.get(`/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // User endpoint - only user's own orders
  getUserOrderDetail: async (orderId: string): Promise<OrderDetailResponse> => {
    try {
      const response = await axiosInstance.get(`/user/orders/${orderId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Generic endpoint - role-based access
  getOrderDetail: async (orderId: string): Promise<OrderDetailResponse> => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updateOrderStatus: async (
    orderId: number,
    data: UpdateOrderStatusData
  ): Promise<{ success: boolean; message: string; data: OrderDetail }> => {
    try {
      const response = await axiosInstance.put(
        `/admin/orders/${orderId}/status`,
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  cancelOrder: async (
    orderId: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.put(
        `/user/orders/${orderId}/cancel`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteOrder: async (
    orderId: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.delete(`/user/orders/${orderId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Admin order detail hook - uses admin endpoint
export const useOrderDetail = (orderId: string): UseOrderDetailReturn => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching order details
  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminOrderDetail", orderId],
    queryFn: () => OrderDetailService.getAdminOrderDetail(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
      notes,
    }: {
      orderId: number;
      status: "approved" | "rejected";
      notes?: string;
    }) => {
      console.log(`Updating order ${orderId} status to ${status}...`);
      const result = await OrderDetailService.updateOrderStatus(orderId, {
        status,
        notes,
      });
      console.log(`Order ${orderId} status updated successfully`);
      return result;
    },
    onSuccess: (result, variables) => {
      // Update the order detail cache
      queryClient.setQueryData(
        ["adminOrderDetail", orderId],
        (oldData: OrderDetailResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              status: variables.status,
              updated_at: new Date().toISOString(),
            },
          };
        }
      );

      // Invalidate and refetch orders list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // Show success toast
      toast({
        title: "Success",
        description: result.message || `Order ${variables.status} successfully`,
      });
    },
    onError: (error) => {
      console.error("Error updating order status:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update order status";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Helper function to update status
  const updateStatus = async (
    status: "approved" | "rejected",
    notes?: string
  ) => {
    if (!orderResponse?.data) {
      throw new Error("Order not found");
    }

    await updateStatusMutation.mutateAsync({
      orderId: orderResponse.data.id,
      status,
      notes,
    });
  };

  return {
    order: orderResponse?.data || null,
    isLoading,
    error: error as Error | null,
    refetch,
    updateStatus,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};

// User order detail hook - uses user endpoint
export const useUserOrderDetail = (
  orderId: string
): UseUserOrderDetailReturn => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userOrderDetail", orderId],
    queryFn: () => OrderDetailService.getUserOrderDetail(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // User-specific order actions
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await OrderDetailService.cancelOrder(orderId);
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        ["userOrderDetail", orderId],
        (oldData: OrderDetailResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              status: "cancelled" as const,
              updated_at: new Date().toISOString(),
            },
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["userOrderDetail", orderId] });
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      toast({
        title: "Success",
        description: result.message || "Order cancelled successfully",
      });
    },
    onError: (error) => {
      console.error("Error cancelling order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel order";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await OrderDetailService.deleteOrder(orderId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      toast({
        title: "Success",
        description: result.message || "Order deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete order";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const cancelOrder = async (orderId: number) => {
    await cancelOrderMutation.mutateAsync(orderId);
  };

  const deleteOrder = async (orderId: number) => {
    await deleteOrderMutation.mutateAsync(orderId);
  };

  return {
    order: orderResponse?.data || null,
    isLoading,
    error: error as Error | null,
    refetch,
    cancelOrder,
    deleteOrder,
    isCancellingOrder: cancelOrderMutation.isPending,
    isDeletingOrder: deleteOrderMutation.isPending,
  };
};

// Generic hook that works for both admin and user based on their role
export const useOrderDetailGeneric = (orderId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orderDetailGeneric", orderId],
    queryFn: () => OrderDetailService.getOrderDetail(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    order: orderResponse?.data || null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};

// Export the service for direct use if needed
export { OrderDetailService };
