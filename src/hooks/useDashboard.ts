import { useApiQuery } from "./useApi";

interface DashboardApiResponse {
  stats: {
    approvedOrders: number;
    totalStores: number;
    totalMembers: number;
    pendingOrders: number;
  };
  recentOrders: {
    id: string;
    memberName: string;
    user_name: string;
    store_name: string;
    product_names: Array<string>;
    storeName: string;
    total: number;
    status: "pending" | "approved" | "rejected";
  }[];
  storePerformance: {
    name: string;
    store_id: string;
    member_count: string;
  }[];
}

export const useDashboard = () => {
  const { data, isLoading, error, refetch } = useApiQuery<DashboardApiResponse>(
    {
      queryKey: ["adminDashboard"],
      queryFn: async () => {
        const token = localStorage.getItem("accessToken");
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (!response.ok || !result.success)
          throw new Error("Failed to fetch dashboard");
        return result.data;
      },
      staleTime: 2 * 60 * 1000,
    }
  );

  const stores =
    data?.storePerformance.map((s) => ({
      name: s.name,
      storeId: s.store_id,
      memberCount: parseInt(s.member_count, 10),
    })) ?? [];

  const orders = data?.recentOrders ?? [];
  const members = Array.from({ length: data?.stats.totalMembers || 0 });

  return {
    stores,
    refetch,
    members,
    orders,
    stats: data?.stats,
    isLoading,
    error,
  };
};
