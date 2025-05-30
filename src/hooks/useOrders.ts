import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  store_id: number | string;
  total_amount: string;
  status: "pending" | "approved" | "rejected";
  items_count: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  store_name: string;
  store_id_ref?: number;
  product_names?: string[];
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: OrdersPagination;
  };
}

export interface UpdateOrderStatusData {
  status: "approved" | "rejected";
}

interface UseOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  store_id?: number;
  search?: string;
}

interface UseOrdersReturn {
  orders: Order[];
  filteredOrders: Order[];
  pagination: OrdersPagination | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  approveOrder: (orderId: number) => Promise<void>;
  rejectOrder: (orderId: number) => Promise<void>;
  refreshOrders: () => void;
  isApprovingOrder: boolean;
  isRejectingOrder: boolean;
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

const OrderService = {
  getOrders: async (params: UseOrdersParams = {}): Promise<OrdersResponse> => {
    try {
      const response = await axiosInstance.get("/admin/orders", { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updateOrderStatus: async (
    orderId: number,
    data: UpdateOrderStatusData
  ): Promise<{ success: boolean; message: string; data: Order }> => {
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
};

export const useOrders = (params: UseOrdersParams = {}): UseOrdersReturn => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();


  const {
    data: ordersResponse,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["orders", params],
    queryFn: () => OrderService.getOrders(params),
    staleTime: 5 * 60 * 1000, 
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const orders = ordersResponse?.data?.orders ?? [];
  const pagination = ordersResponse?.data?.pagination ?? null;


  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const approveOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      console.log(`Approving order ${orderId}...`);
      const result = await OrderService.updateOrderStatus(orderId, {
        status: "approved",
      });
      console.log(`Order ${orderId} approved successfully`);
      return result;
    },
    onSuccess: (result) => {
   
      queryClient.setQueryData(
        ["orders", params],
        (oldData: OrdersResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              orders: oldData.data.orders.map((order) =>
                order.id === result.data.id
                  ? { ...order, status: "approved" as const }
                  : order
              ),
            },
          };
        }
      );

      toast({
        title: "Success",
        description: result.message || "Order approved successfully",
      });
    },
    onError: (error) => {
      console.error("Error approving order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to approve order";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });


  const rejectOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      console.log(`Rejecting order ${orderId}...`);
      const result = await OrderService.updateOrderStatus(orderId, {
        status: "rejected",
      });
      console.log(`Order ${orderId} rejected successfully`);
      return result;
    },
    onSuccess: (result) => {
   
      queryClient.setQueryData(
        ["orders", params],
        (oldData: OrdersResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              orders: oldData.data.orders.map((order) =>
                order.id === result.data.id
                  ? { ...order, status: "rejected" as const }
                  : order
              ),
            },
          };
        }
      );

      toast({
        title: "Order Rejected",
        description: result.message || "Order has been rejected",
      });
    },
    onError: (error) => {
      console.error("Error rejecting order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reject order";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to fetch orders"
    : null;

  const approveOrder = async (orderId: number) => {
    await approveOrderMutation.mutateAsync(orderId);
  };

  const rejectOrder = async (orderId: number) => {
    await rejectOrderMutation.mutateAsync(orderId);
  };

  const refreshOrders = () => {
    console.log("Refreshing orders...");
    refetch();
  };

  return {
    orders,
    filteredOrders,
    pagination,
    isLoading: isLoading,
    error,
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
    approveOrder,
    rejectOrder,
    refreshOrders,
    isApprovingOrder: approveOrderMutation.isPending,
    isRejectingOrder: rejectOrderMutation.isPending,
  };
};
