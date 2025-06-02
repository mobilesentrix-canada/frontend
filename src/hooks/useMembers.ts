import axios from "axios";
import { useApiQuery, useApiMutation } from "./useApi";

// Updated Member interface with all new fields
export interface Member {
  id: number;
  email: string;
  name: string;
  phone_number?: string;
  role: string;
  designation: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  store_name: string | null;
  store_id: string | null;
}

// Updated CreateMemberData interface
export interface CreateMemberData {
  email: string;
  password: string;
  confirmPassword?: string;
  name: string;
  phone_number?: string;
  role: string;
  designation: any;
  store_id?: number;
  is_active?: boolean;
}

// Updated UpdateMemberData interface
export interface UpdateMemberData {
  name?: string;
  phone_number?: string;
  role?: string;
  designation?: any;
  is_active?: boolean;
  store_id?: number | string;
  password?: string;
  confirmPassword?: string;
}

export interface AssignStoreData {
  userId: number;
  storeId: number;
}

export interface MembersPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface MembersResponse {
  success: boolean;
  data: {
    users: Member[];
    pagination: MembersPagination;
  };
}

// Updated UseMembersParams interface
interface UseMembersParams {
  page?: number;
  limit?: number;
  role?: string;
  designation?: any;
  status?: string;
  search?: string;
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

const MemberService = {
  getMembers: async (
    params: UseMembersParams = {}
  ): Promise<MembersResponse> => {
    try {
      // Clean up params to only send non-empty values
      const cleanParams: any = {};

      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
      if (params.search && params.search.trim())
        cleanParams.search = params.search.trim();

      // Only add filters if they have actual values (not empty, not "all")
      if (params.role && params.role !== "all" && params.role.trim() !== "") {
        cleanParams.role = params.role;
      }

      if (
        params.designation &&
        params.designation !== "all" &&
        params.designation.trim() !== ""
      ) {
        cleanParams.designation = params.designation;
      }

      if (
        params.status &&
        params.status !== "all" &&
        params.status.trim() !== ""
      ) {
        cleanParams.status = params.status;
      }

      const response = await axiosInstance.get("/admin/users", {
        params: cleanParams,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  createMember: async (
    data: CreateMemberData
  ): Promise<{ success: boolean; message: string; data: Member }> => {
    try {
      // Validate password confirmation on frontend
      if (data.password !== data.confirmPassword) {
        throw new Error("Password and confirm password do not match");
      }

      // 🔧 FIX: Send the data as-is, including confirmPassword
      // Your backend expects confirmPassword, so don't remove it
      const response = await axiosInstance.post("/admin/users", data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updateMember: async (
    id: number,
    data: UpdateMemberData
  ): Promise<{ success: boolean; message: string; data: Member }> => {
    try {
      // Validate password confirmation if password is being updated
      if (data.password && data.password !== data.confirmPassword) {
        throw new Error("Password and confirm password do not match");
      }

      // 🔧 FIX: Send the data as-is, including confirmPassword
      // Your backend expects confirmPassword, so don't remove it
      const response = await axiosInstance.put(`/admin/users/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteMember: async (
    id: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  assignStore: async (
    data: AssignStoreData
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post(
        "/admin/users/assign-store",
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

export const useMembers = (params: UseMembersParams = {}) => {
  const {
    data: membersResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: [
      "members",
      params.page,
      params.limit,
      params.search,
      params.role,
      params.designation,
      params.status,
    ],
    queryFn: () => MemberService.getMembers(params),
    staleTime: 2 * 60 * 1000,
  });

  const members = membersResponse?.data?.users ?? [];
  const pagination = membersResponse?.data?.pagination ?? null;

  const addMemberMutation = useApiMutation({
    mutationFn: (memberData: CreateMemberData) =>
      MemberService.createMember(memberData),
    invalidateQueries: [["members"]],
    onSuccess: () => {
      console.log("Member added successfully");
    },
    onError: (error) => {
      console.error("Error adding member:", error);
    },
  });

  const updateMemberMutation = useApiMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMemberData }) =>
      MemberService.updateMember(id, data),
    invalidateQueries: [["members"]],
    onSuccess: () => {
      console.log("Member updated successfully");
    },
    onError: (error) => {
      console.error("Error updating member:", error);
    },
  });

  const deleteMemberMutation = useApiMutation({
    mutationFn: (id: number) => MemberService.deleteMember(id),
    invalidateQueries: [["members"]],
    onSuccess: () => {
      console.log("Member deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting member:", error);
    },
  });

  const assignStoreMutation = useApiMutation({
    mutationFn: (data: AssignStoreData) => MemberService.assignStore(data),
    invalidateQueries: [["members"]],
    onSuccess: () => {
      console.log("Store assigned successfully");
    },
    onError: (error) => {
      console.error("Error assigning store:", error);
    },
  });

  return {
    members,
    pagination,
    isLoading,
    error,
    refetch,
    addMember: addMemberMutation.mutate,
    updateMember: (id: number, data: UpdateMemberData) =>
      updateMemberMutation.mutate({ id, data }),
    deleteMember: deleteMemberMutation.mutate,
    assignStore: assignStoreMutation.mutate,
    isAddingMember: addMemberMutation.isPending,
    isUpdatingMember: updateMemberMutation.isPending,
    isDeletingMember: deleteMemberMutation.isPending,
    isAssigningStore: assignStoreMutation.isPending,
    addMemberError: addMemberMutation.error,
    updateMemberError: updateMemberMutation.error,
    deleteMemberError: deleteMemberMutation.error,
    assignStoreError: assignStoreMutation.error,
  };
};
