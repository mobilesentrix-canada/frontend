import { useApiQuery, useApiMutation } from "./useApi";

export interface Store {
  id: number;
  name: string;
  location: string;
  store_id: string;
  admin_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  admin_name?: string;
  member_count?: string | number;
}

interface StoreApiResponse {
  stores: Store[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UseStoresParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}
const apiUrl = import.meta.env.VITE_API_URL;

const BASE_URL = `${apiUrl}/admin/stores`;

export const useStores = (params: UseStoresParams = {}) => {
  const { page = 1, limit = 10, searchTerm = "" } = params;

  const { data, isLoading, error, refetch } = useApiQuery<StoreApiResponse>({
    queryKey: ["stores", page, limit, searchTerm],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const searchQuery = encodeURIComponent(searchTerm);
      const res = await fetch(
        `${BASE_URL}?page=${page}&limit=${limit}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error("Failed to fetch stores");
      }

      return result.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const stores = data?.stores ?? [];
  const pagination = data?.pagination;

  const addStoreMutation = useApiMutation({
    mutationFn: async (
      storeData: Omit<Store, "id" | "admin_id" | "created_at" | "updated_at">
    ) => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storeData),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to add store");
      }

      return result.data;
    },
    invalidateQueries: [["stores"]],
    onSuccess: () => {
      console.log("Store added successfully");
    },
  });

  const updateStoreMutation = useApiMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Store> }) => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to update store");
      }

      return result.data;
    },
    invalidateQueries: [["stores"]],
    onSuccess: () => {
      console.log("Store updated successfully");
    },
  });

  const deleteStoreMutation = useApiMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete store");
      }
    },
    invalidateQueries: [["stores"]],
    onSuccess: () => {
      console.log("Store deleted successfully");
    },
  });

  return {
    stores,
    pagination,
    isLoading,
    error,
    refetch,
    addStore: addStoreMutation.mutate,
    updateStore: (id: number, data: Partial<Store>) =>
      updateStoreMutation.mutate({ id, data }),
    deleteStore: deleteStoreMutation.mutate,
    isAddingStore: addStoreMutation.isPending,
    isUpdatingStore: updateStoreMutation.isPending,
    isDeletingStore: deleteStoreMutation.isPending,
  };
};
