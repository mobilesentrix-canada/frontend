import axios from "axios";
import { useApiQuery, useApiMutation } from "./useApi";

export interface Member {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  store_name: string | null;
  store_id: string | null;
}

export interface CreateMemberData {
  email: string;
  password: string;
  name: string;
  role: string;
  store_id?: number;
}

export interface UpdateMemberData {
  name?: string;
  role?: string;
  is_active?: boolean;
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

interface UseMembersParams {
  page?: number;
  limit?: number;
  role?: string;
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
      const response = await axiosInstance.get("/admin/users", { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  createMember: async (
    data: CreateMemberData
  ): Promise<{ success: boolean; message: string; data: Member }> => {
    try {
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
    queryKey: ["members", params],
    queryFn: () => MemberService.getMembers(params),
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
  });

  const assignStoreMutation = useApiMutation({
    mutationFn: (data: AssignStoreData) => MemberService.assignStore(data),
    invalidateQueries: [["members"]],
    onSuccess: () => {
      console.log("Store assigned successfully");
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
