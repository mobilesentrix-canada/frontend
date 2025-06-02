import { useApiQuery, useApiMutation } from "./useApi";

export interface Store {
  id: number;
  name: string;
  store_type: "owned" | "franchise";
  location: string;
  store_id: string;
  status: "active" | "inactive" | "maintenance";
  manager_name?: string;
  phone_number?: string;
  email_address?: string;
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
  store_type?: string;
  status?: string;
}

export interface StoreFormData {
  name: string;
  store_type: "owned" | "franchise";
  location: string;
  manager_name?: string;
  phone_number?: string;
  email_address?: string;
  status: "active" | "inactive" | "maintenance";
  is_active?: boolean;
  store_id?: any;
}

const apiUrl = import.meta.env.VITE_API_URL;
const BASE_URL = `${apiUrl}/admin/stores`;

export const useStores = (params: UseStoresParams = {}) => {
  const {
    page = 1,
    limit = 10,
    searchTerm = "",
    store_type = "",
    status = "",
  } = params;

  const { data, isLoading, error, refetch } = useApiQuery<StoreApiResponse>({
    queryKey: ["stores", page, limit, searchTerm, store_type, status],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      if (searchTerm.trim()) {
        queryParams.append("search", searchTerm.trim());
      }

      // Only add filters if they have actual values (not empty, not "all")
      if (store_type && store_type !== "all" && store_type.trim() !== "") {
        queryParams.append("store_type", store_type);
      }

      if (status && status !== "all" && status.trim() !== "") {
        queryParams.append("status", status);
      }

      const res = await fetch(`${BASE_URL}?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch stores");
      }

      return result.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const stores = data?.stores ?? [];
  const pagination = data?.pagination;

  const addStoreMutation = useApiMutation({
    mutationFn: async (storeData: StoreFormData) => {
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
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<StoreFormData>;
    }) => {
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
    updateStore: (id: number, data: Partial<StoreFormData>) =>
      updateStoreMutation.mutate({ id, data }),
    deleteStore: deleteStoreMutation.mutate,
    isAddingStore: addStoreMutation.isPending,
    isUpdatingStore: updateStoreMutation.isPending,
    isDeletingStore: deleteStoreMutation.isPending,
  };
};
