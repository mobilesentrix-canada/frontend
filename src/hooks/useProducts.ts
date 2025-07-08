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
  badges: any;
  image: string;
}

export interface ProductsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: ProductsPagination;
  };
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
}

// Search interfaces
export interface SearchProduct {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  link?: string;
  image?: string;
  product_code?: string;
  quantity?: number;
  tags?: string;
  reviews_count?: number;
  reviews_average?: number;
  category?: string;
  original_data?: any;
}

export interface SearchPagination {
  query: string;
  max_results: number;
  start_index: number;
  total: number;
  returned?: number;
}

export interface SearchResponse {
  success: boolean;
  data: {
    query: string;
    products: SearchProduct[];
    pagination: SearchPagination;
    meta: {
      source: string;
      timestamp: string;
      total_returned: number;
    };
  };
}

export interface SearchSuggestionsResponse {
  success: boolean;
  data: {
    query: string;
    suggestions: Array<{
      text: string;
      value: string;
      category: string;
    }>;
  };
}

export interface PopularSearchesResponse {
  success: boolean;
  data: {
    popular_searches: string[];
  };
}

export interface Category {
  id: string;
  name: string;
  url_key: string | null;
  has_children: boolean;
  parent_id: string | null;
}

export interface SubCategory {
  entity_id: number;
  level: number;
  children_count: number;
  meta_keywords: string;
  children: any;
  is_anchor: string;
  is_part: string;
  is_active: string;
  name: string;
  meta_title: string;
  has_children: boolean;
  image_url: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface SubCategoriesResponse {
  success: boolean;
  data: SubCategory[];
}

interface UseProductsParams {
  page?: number;
  limit?: number;
  categoryId?: number;
}

interface UseSearchParams {
  query: string;
  max_results?: number;
  start_index?: number;
  raw?: boolean;
}

interface UseCategoriesParams {
  categoryId?: number;
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
  getProducts: async (
    params: UseProductsParams = {}
  ): Promise<ProductsResponse> => {
    try {
      const { categoryId, ...queryParams } = params;
      let endpoint = "/products";

      if (categoryId) {
        endpoint = `/products/category/${categoryId}`;
      }

      const response = await axiosInstance.get(endpoint, {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getProduct: async (id: number): Promise<SingleProductResponse> => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // NEW: Search products
  searchProducts: async (params: UseSearchParams): Promise<SearchResponse> => {
    try {
      const { query, max_results = 10, start_index = 0, raw = false } = params;

      if (!query || query.trim() === "") {
        throw new Error("Search query is required");
      }

      const response = await axiosInstance.get("/products/search", {
        params: {
          q: query.trim(),
          max_results,
          start_index,
          raw,
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // NEW: Get search suggestions
  getSearchSuggestions: async (
    query: string,
    limit: number = 5
  ): Promise<SearchSuggestionsResponse> => {
    try {
      const response = await axiosInstance.get("/products/search/suggestions", {
        params: { q: query, limit },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // NEW: Get popular searches
  getPopularSearches: async (): Promise<PopularSearchesResponse> => {
    try {
      const response = await axiosInstance.get("/products/search/popular");
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

const CategoryService = {
  getCategories: async (): Promise<CategoriesResponse> => {
    try {
      const response = await axiosInstance.get("/products/categories");
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getSubCategories: async (
    categoryId: number
  ): Promise<SubCategoriesResponse> => {
    try {
      const response = await axiosInstance.get(
        `/products/categories/${categoryId}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Existing hooks
export const useProducts = (params: UseProductsParams = {}) => {
  const {
    data: productsResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ["products", params],
    queryFn: () => ProductService.getProducts(params),
  });

  const products = productsResponse?.data?.products ?? [];
  const pagination = productsResponse?.data?.pagination ?? null;

  return {
    products,
    pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useProduct = (id: number) => {
  const {
    data: productResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ["product", id],
    queryFn: () => ProductService.getProduct(id),
    enabled: !!id,
  });

  const product = productResponse?.data ?? null;

  return {
    product,
    isLoading,
    error,
    refetch,
  };
};

export const useCategories = () => {
  const {
    data: categoriesResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ["categories"],
    queryFn: () => CategoryService.getCategories(),
  });

  const categories = categoriesResponse?.data ?? [];

  return {
    categories,
    isLoading,
    error,
    refetch,
  };
};

export const useSubCategories = (categoryId: number) => {
  const {
    data: subCategoriesResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: () => CategoryService.getSubCategories(categoryId),
    enabled: !!categoryId,
  });

  const subCategories = subCategoriesResponse?.data ?? [];

  return {
    subCategories,
    isLoading,
    error,
    refetch,
  };
};

// NEW: Search hooks
export const useSearchProducts = (params: UseSearchParams) => {
  const {
    data: searchResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ["search-products", params],
    queryFn: () => ProductService.searchProducts(params),
    enabled: !!params.query && params.query.trim().length > 0,
  });

  const searchResults = searchResponse?.data?.products ?? [];
  const searchPagination = searchResponse?.data?.pagination ?? null;
  const searchMeta = searchResponse?.data?.meta ?? null;

  return {
    searchResults,
    searchPagination,
    searchMeta,
    isLoading,
    error,
    refetch,
  };
};

export const useSearchSuggestions = (query: string, limit: number = 5) => {
  const {
    data: suggestionsResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ["search-suggestions", query, limit],
    queryFn: () => ProductService.getSearchSuggestions(query, limit),
    enabled: !!query && query.trim().length >= 2,
  });

  const suggestions = suggestionsResponse?.data?.suggestions ?? [];

  return {
    suggestions,
    isLoading,
    error,
    refetch,
  };
};

export const usePopularSearches = () => {
  const {
    data: popularResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ["popular-searches"],
    queryFn: () => ProductService.getPopularSearches(),
  });

  const popularSearches = popularResponse?.data?.popular_searches ?? [];

  return {
    popularSearches,
    isLoading,
    error,
    refetch,
  };
};

export const useProductsWithCategories = (params: UseProductsParams = {}) => {
  const productsHook = useProducts(params);
  const categoriesHook = useCategories();

  return {
    ...productsHook,
    categories: categoriesHook.categories,
    isCategoriesLoading: categoriesHook.isLoading,
    categoriesError: categoriesHook.error,
    refetchCategories: categoriesHook.refetch,
  };
};
