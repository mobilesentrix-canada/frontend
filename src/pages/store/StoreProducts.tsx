import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  useProducts,
  useCategories,
  useSubCategories,
  Product,
} from "@/hooks/useProducts";
import { useCart, useWishlist } from "@/hooks/useCart";
import {
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  X,
  Heart,
  Plus,
  ChevronLeft,
  Search,
  Minus,
  ArrowRight,
  Folder,
  FolderOpen,
  Menu,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { STATIC_CATEGORIES } from "@/db";
import {
  Tabs,
  Tab,
  Box,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Simple styled tabs
const StyledTabs = styled(Tabs)({
  minHeight: 40,
  "& .MuiTabs-indicator": {
    backgroundColor: "#dc2626",
    height: 2,
  },
});

const StyledTab = styled(Tab)({
  textTransform: "none",
  minWidth: 100,
  fontWeight: 500,
  fontSize: "14px",
  color: "#6b7280",
  "&.Mui-selected": {
    color: "#dc2626",
    fontWeight: 600,
  },
  "&:hover": {
    color: "#374151",
  },
});

export default function StoreProducts() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    number | null
  >(null);
  const [selectedNestedSubCategoryId, setSelectedNestedSubCategoryId] =
    useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(
    null
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Refs to maintain focus
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Fixed: Use conditional hooks with proper error handling
  const allCategoryHooks = STATIC_CATEGORIES.map((category) => {
    try {
      return useSubCategories(category.entity_id);
    } catch (error) {
      console.error(
        `Error fetching subcategories for category ${category.entity_id}:`,
        error
      );
      return { subCategories: [], isLoading: false, error };
    }
  });

  // Store additional nested categories data as users explore
  const [additionalNestedData, setAdditionalNestedData] = useState<any[]>([]);

  // Get currently selected category data for UI display
  const selectedCategoryData = allCategoryHooks.find(
    (_, index) => STATIC_CATEGORIES[index].entity_id === selectedCategoryId
  );
  const subCategories = selectedCategoryData?.subCategories || [];
  const subCategoriesLoading = selectedCategoryData?.isLoading || false;

  // Fixed: Only fetch nested subcategories when we have a valid selectedSubCategoryId
  const {
    subCategories: nestedSubCategories = [],
    isLoading: nestedSubCategoriesLoading = false,
    error: nestedSubCategoriesError = null,
  } = useSubCategories(
    selectedSubCategoryId && selectedSubCategoryId > 0
      ? selectedSubCategoryId
      : null
  );

  // Add nested subcategories to additional data when they're loaded
  useEffect(() => {
    if (selectedSubCategoryId && nestedSubCategories.length > 0) {
      const parentCategory = STATIC_CATEGORIES.find(
        (cat) => cat.entity_id === selectedCategoryId
      );
      const parentSubCategory = subCategories.find(
        (sub) => sub.entity_id === selectedSubCategoryId
      );

      if (parentCategory && parentSubCategory) {
        const newNestedData = nestedSubCategories.map((nestedSubCat) => ({
          id: nestedSubCat.entity_id,
          name: nestedSubCat.name,
          type: "nestedSubcategory",
          level: 3,
          fullPath: `${parentCategory.name} > ${parentSubCategory.name} > ${nestedSubCat.name}`,
          parentId: selectedSubCategoryId,
          grandParentId: selectedCategoryId,
          searchTerms:
            `${parentCategory.name} ${parentSubCategory.name} ${nestedSubCat.name}`.toLowerCase(),
          description: `Nested Subcategory: ${nestedSubCat.name} in ${parentSubCategory.name}`,
          parent: `${parentCategory.name} > ${parentSubCategory.name}`,
        }));

        setAdditionalNestedData((prev) => {
          // Remove existing nested subcategories for this subcategory and add new ones
          const filtered = prev.filter(
            (item) => item.parentId !== selectedSubCategoryId
          );
          return [...filtered, ...newNestedData];
        });
      }
    }
  }, [
    selectedSubCategoryId,
    nestedSubCategories,
    subCategories,
    selectedCategoryId,
  ]);

  // Build comprehensive search data from all hook results
  const allCategoriesData = useMemo(() => {
    const allData: any[] = [];

    // Add main categories first
    STATIC_CATEGORIES.forEach((cat) => {
      allData.push({
        id: cat.entity_id,
        name: cat.name,
        type: "category",
        level: 1,
        fullPath: cat.name,
        searchTerms: cat.name.toLowerCase(),
        description: `Category: ${cat.name}`,
        parent: null,
        parentId: null,
        grandParentId: null,
      });
    });

    // Add subcategories from all categories with error handling
    STATIC_CATEGORIES.forEach((category, index) => {
      const hookData = allCategoryHooks[index];
      if (hookData && !hookData.error && hookData.subCategories) {
        hookData.subCategories.forEach((subCat: any) => {
          allData.push({
            id: subCat.entity_id,
            name: subCat.name,
            type: "subcategory",
            level: 2,
            fullPath: `${category.name} > ${subCat.name}`,
            parentId: category.entity_id,
            grandParentId: null,
            searchTerms: `${category.name} ${subCat.name}`.toLowerCase(),
            description: `Subcategory: ${subCat.name} in ${category.name}`,
            parent: category.name,
          });
        });
      }
    });

    // Add nested subcategories that have been loaded through navigation
    allData.push(...additionalNestedData);

    console.log(`📊 Search data contains ${allData.length} items:`, {
      categories: allData.filter((item) => item.type === "category").length,
      subcategories: allData.filter((item) => item.type === "subcategory")
        .length,
      nestedSubcategories: allData.filter(
        (item) => item.type === "nestedSubcategory"
      ).length,
    });

    return allData;
  }, [allCategoryHooks, additionalNestedData]);

  // Simple and comprehensive search filter
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const words = query.split(" ").filter((word) => word.length > 0);

    // Search through ALL available data
    const results = allCategoriesData
      .filter((item) => {
        // Check if any search word matches the item
        return words.some(
          (word) =>
            item.searchTerms.includes(word) ||
            item.name.toLowerCase().includes(word)
        );
      })
      .sort((a, b) => {
        // Sort by relevance: exact matches first, then by level
        const aExactMatch = a.name.toLowerCase() === query;
        const bExactMatch = b.name.toLowerCase() === query;

        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        // Then sort by name match at the beginning
        const aStartsWithQuery = a.name.toLowerCase().startsWith(query);
        const bStartsWithQuery = b.name.toLowerCase().startsWith(query);

        if (aStartsWithQuery && !bStartsWithQuery) return -1;
        if (!aStartsWithQuery && bStartsWithQuery) return 1;

        // Finally sort by level (categories first, then subcategories, then nested)
        return a.level - b.level;
      });

    // Debug log
    if (results.length > 0) {
      console.log(`🔍 Search "${query}" found ${results.length} results:`, {
        categories: results.filter((r) => r.type === "category").length,
        subcategories: results.filter((r) => r.type === "subcategory").length,
        nestedSubcategories: results.filter(
          (r) => r.type === "nestedSubcategory"
        ).length,
      });
    }

    return results;
  }, [allCategoriesData, searchQuery]);

  // Fixed: Fetch products with proper error handling and parameter validation
  const productParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: 12,
    };

    // Priority: nested subcategory > subcategory > main category
    if (selectedNestedSubCategoryId && selectedNestedSubCategoryId > 0) {
      params.categoryId = selectedNestedSubCategoryId;
      console.log(
        "🔍 Fetching products for nested subcategory:",
        selectedNestedSubCategoryId
      );
    } else if (selectedSubCategoryId && selectedSubCategoryId > 0) {
      params.categoryId = selectedSubCategoryId;
      console.log(
        "🔍 Fetching products for subcategory:",
        selectedSubCategoryId
      );
    } else if (selectedCategoryId && selectedCategoryId > 0) {
      params.categoryId = selectedCategoryId;
      console.log(
        "🔍 Fetching products for main category:",
        selectedCategoryId
      );
    } else {
      console.log("🔍 Fetching all products");
    }

    return params;
  }, [
    currentPage,
    selectedNestedSubCategoryId,
    selectedSubCategoryId,
    selectedCategoryId,
  ]);

  const {
    products = [],
    pagination,
    isLoading: productsLoading = false,
    error: productsError = null,
  } = useProducts(productParams);

  // Add debugging for the products response
  useEffect(() => {
    console.log("📦 Products response:", {
      productsCount: products.length,
      isLoading: productsLoading,
      hasError: !!productsError,
      pagination,
      params: productParams,
    });
  }, [products, productsLoading, productsError, pagination, productParams]);

  const {
    addToCart,
    count: cartCount = 0,
    cartItems = [],
    updateCartItem,
    removeCartItem,
  } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isAddingToWishlist = false,
    isRemovingFromWishlist = false,
  } = useWishlist();

  const categories = STATIC_CATEGORIES.map((cat) => ({
    id: cat.entity_id.toString(),
    name: cat.name,
    has_children: cat.has_children,
    image_url: cat.image_url,
  }));

  // Helper functions
  const getCartItemForProduct = useCallback(
    (productId: number) => {
      return cartItems.find((item) => item.product.id === productId);
    },
    [cartItems]
  );

  const getProductQuantityInCart = useCallback(
    (productId: number) => {
      const cartItem = getCartItemForProduct(productId);
      return cartItem ? cartItem.quantity : 0;
    },
    [getCartItemForProduct]
  );

  const handleAddToCart = useCallback(
    async (product: Product) => {
      if (!product || !product.id) {
        toast({
          title: "Error",
          description: "Invalid product data",
          variant: "destructive",
        });
        return;
      }

      setLoadingProductId(product.id);
      try {
        await addToCart(
          { product_id: product.id, quantity: 1 },
          {
            onSuccess: () => {
              toast({
                title: "Added to cart",
                description: `${product.name} has been added to your cart`,
              });
            },
            onError: (error: any) => {
              toast({
                title: "Error",
                description: error?.message || "Failed to add product to cart",
                variant: "destructive",
              });
            },
          }
        );
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to add product to cart",
          variant: "destructive",
        });
      } finally {
        setLoadingProductId(null);
      }
    },
    [addToCart, toast]
  );

  const handleUpdateCartQuantity = useCallback(
    async (product: Product, newQuantity: number) => {
      if (!product || !product.id) return;

      const cartItem = getCartItemForProduct(product.id);
      if (!cartItem) return;

      if (newQuantity < 1) {
        handleRemoveFromCart(product);
        return;
      }

      setUpdatingProductId(product.id);
      try {
        await updateCartItem(cartItem.id, { quantity: newQuantity });
        toast({
          title: "Cart updated",
          description: `${product.name} quantity updated`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to update cart",
          variant: "destructive",
        });
      } finally {
        setUpdatingProductId(null);
      }
    },
    [getCartItemForProduct, updateCartItem, toast]
  );

  const handleRemoveFromCart = useCallback(
    async (product: Product) => {
      if (!product || !product.id) return;

      const cartItem = getCartItemForProduct(product.id);
      if (!cartItem) return;

      setUpdatingProductId(product.id);
      try {
        await removeCartItem(cartItem.id);
        toast({
          title: "Removed from cart",
          description: `${product.name} has been removed from your cart`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to remove from cart",
          variant: "destructive",
        });
      } finally {
        setUpdatingProductId(null);
      }
    },
    [getCartItemForProduct, removeCartItem, toast]
  );

  const handleWishlistToggle = useCallback(
    async (product: Product) => {
      if (!product || !product.id) return;

      const productId = product.id;
      try {
        if (isInWishlist(productId)) {
          await removeFromWishlist(productId, {
            onSuccess: () => {
              toast({
                title: "Removed from wishlist",
                description: `${product.name} has been removed from your wishlist`,
              });
            },
            onError: (error: any) => {
              toast({
                title: "Error",
                description: error?.message || "Failed to remove from wishlist",
                variant: "destructive",
              });
            },
          });
        } else {
          await addToWishlist(
            { product_id: productId },
            {
              onSuccess: () => {
                toast({
                  title: "Added to wishlist",
                  description: `${product.name} has been added to your wishlist`,
                });
              },
              onError: (error: any) => {
                toast({
                  title: "Error",
                  description: error?.message || "Failed to add to wishlist",
                  variant: "destructive",
                });
              },
            }
          );
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to update wishlist",
          variant: "destructive",
        });
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist, toast]
  );

  const handleCategoryChange = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      if (newValue === "all") {
        setSelectedCategoryId(null);
        setSelectedSubCategoryId(null);
        setSelectedNestedSubCategoryId(null);
        setExpandedCategory(null);
      } else {
        const numCategoryId = parseInt(newValue);
        if (!isNaN(numCategoryId)) {
          setSelectedCategoryId(numCategoryId);
          setSelectedSubCategoryId(null);
          setSelectedNestedSubCategoryId(null);
          setExpandedCategory(newValue);
        }
      }
      setCurrentPage(1);
      setSearchQuery("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const handleSubCategoryClick = useCallback(
    (subCategoryId: number) => {
      if (!subCategoryId || subCategoryId <= 0) return;

      console.log("🎯 Subcategory clicked:", subCategoryId);

      if (selectedSubCategoryId === subCategoryId) {
        setSelectedSubCategoryId(null);
        setSelectedNestedSubCategoryId(null);
      } else {
        setSelectedSubCategoryId(subCategoryId);
        setSelectedNestedSubCategoryId(null);
      }
      setCurrentPage(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [selectedSubCategoryId]
  );

  const handleNestedSubCategoryClick = useCallback(
    (nestedSubCategoryId: number) => {
      if (!nestedSubCategoryId || nestedSubCategoryId <= 0) return;

      console.log("🎯 Nested subcategory clicked:", nestedSubCategoryId);
      setSelectedNestedSubCategoryId(nestedSubCategoryId);
      setCurrentPage(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const handleSearchResultClick = useCallback((item: any) => {
    if (!item || !item.id) return;

    console.log("🎯 Search result clicked:", item);
    setCurrentPage(1);

    if (item.type === "category") {
      setSelectedCategoryId(item.id);
      setSelectedSubCategoryId(null);
      setSelectedNestedSubCategoryId(null);
      setExpandedCategory(item.id.toString());
    } else if (item.type === "subcategory") {
      setSelectedCategoryId(item.parentId);
      setSelectedSubCategoryId(item.id);
      setSelectedNestedSubCategoryId(null);
      setExpandedCategory(item.parentId?.toString());
    } else if (item.type === "nestedSubcategory") {
      setSelectedCategoryId(item.grandParentId);
      setSelectedSubCategoryId(item.parentId);
      setSelectedNestedSubCategoryId(item.id);
      setExpandedCategory(item.grandParentId?.toString());
    }

    setTimeout(() => {
      setSearchQuery("");
    }, 100);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const clearFilters = useCallback(() => {
    console.log("🧹 Clearing all filters");
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedNestedSubCategoryId(null);
    setExpandedCategory(null);
    setSearchQuery("");
    setCurrentPage(1);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setSearchQuery(newValue);

      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        if (mobileSearchInputRef.current) {
          mobileSearchInputRef.current.focus();
        }
      }, 0);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const handleMobileCategorySelect = useCallback(
    (categoryId: number | null) => {
      console.log("📱 Mobile category selected:", categoryId);
      setSelectedCategoryId(categoryId);
      setSelectedSubCategoryId(null);
      setSelectedNestedSubCategoryId(null);
      setExpandedCategory(categoryId?.toString() || null);
      setCurrentPage(1);
      setSearchQuery("");
      setIsMobileSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const handleMobileSubCategorySelect = useCallback((subCategoryId: number) => {
    if (!subCategoryId || subCategoryId <= 0) return;

    console.log("📱 Mobile subcategory selected:", subCategoryId);
    setSelectedSubCategoryId(subCategoryId);
    setSelectedNestedSubCategoryId(null);
    setCurrentPage(1);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleMobileNestedSubCategorySelect = useCallback(
    (nestedSubCategoryId: number) => {
      if (!nestedSubCategoryId || nestedSubCategoryId <= 0) return;

      console.log(
        "📱 Mobile nested subcategory selected:",
        nestedSubCategoryId
      );
      setSelectedNestedSubCategoryId(nestedSubCategoryId);
      setCurrentPage(1);
      setIsMobileSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  // Effect to log category state changes
  useEffect(() => {
    console.log("🏷️ Category state changed:", {
      selectedCategoryId,
      selectedSubCategoryId,
      selectedNestedSubCategoryId,
      currentPage,
    });
  }, [
    selectedCategoryId,
    selectedSubCategoryId,
    selectedNestedSubCategoryId,
    currentPage,
  ]);

  const SidebarContent = React.memo(
    ({ isMobile = false }: { isMobile?: boolean }) => (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>

          <div className="relative">
            <TextField
              inputRef={isMobile ? mobileSearchInputRef : searchInputRef}
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              fullWidth
              variant="outlined"
              autoComplete="off"
              spellCheck={false}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="w-4 h-4 text-gray-400" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClearSearch}
                      size="small"
                      aria-label="Clear search"
                      sx={{ color: "gray" }}
                    >
                      <X className="w-4 h-4" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  height: "40px",
                  fontSize: "14px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#e5e7eb",
                  },
                  "&:hover fieldset": {
                    borderColor: "#d1d5db",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#dc2626",
                    borderWidth: "1px",
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Search Results */}
          {searchQuery && filteredCategories.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">
                Search Results ({filteredCategories.length})
              </div>
              <div className="space-y-1">
                {filteredCategories.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      handleSearchResultClick(item);
                      if (isMobile) setIsMobileSidebarOpen(false);
                    }}
                    className="p-3 hover:bg-gray-50 rounded cursor-pointer text-sm transition-colors border border-gray-100 hover:border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {item.description}
                        </div>
                        <div className="text-xs text-blue-600 mt-1 truncate">
                          {item.fullPath}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === "category"
                              ? "bg-blue-100 text-blue-800"
                              : item.type === "subcategory"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.type === "category"
                            ? "Category"
                            : item.type === "subcategory"
                            ? "Subcategory"
                            : "Nested"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No search results */}
          {searchQuery && filteredCategories.length === 0 && (
            <div className="mb-4 text-center py-8">
              <div className="text-sm text-gray-500">
                No categories found for "{searchQuery}"
              </div>
              <button
                onClick={handleClearSearch}
                className="text-xs text-blue-600 hover:text-blue-800 mt-2"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Category List */}
          {!searchQuery && (
            <div className="space-y-1">
              <div
                onClick={() =>
                  isMobile ? handleMobileCategorySelect(null) : clearFilters()
                }
                className={cn(
                  "p-2 rounded cursor-pointer text-sm transition-colors",
                  !selectedCategoryId
                    ? "bg-red-50 text-red-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                All Categories
              </div>

              {categories.map((category) => {
                const categoryId = parseInt(category.id);
                const hookData = allCategoryHooks.find(
                  (_, index) =>
                    STATIC_CATEGORIES[index].entity_id === categoryId
                );

                return (
                  <div key={category.id} className="space-y-1">
                    <div
                      onClick={() => {
                        if (isMobile) {
                          handleMobileCategorySelect(categoryId);
                        } else {
                          if (selectedCategoryId === categoryId) {
                            setSelectedCategoryId(null);
                            setSelectedSubCategoryId(null);
                            setSelectedNestedSubCategoryId(null);
                            setExpandedCategory(null);
                          } else {
                            handleCategoryChange({} as any, category.id);
                          }
                        }
                      }}
                      className={cn(
                        "p-2 rounded cursor-pointer text-sm flex items-center justify-between transition-colors",
                        selectedCategoryId === categoryId
                          ? "bg-red-50 text-red-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <span>{category.name}</span>
                      {category.has_children && (
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            selectedCategoryId === categoryId && "rotate-180"
                          )}
                        />
                      )}
                    </div>

                    {selectedCategoryId === categoryId && (
                      <div className="ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {subCategoriesLoading ? (
                          <div className="space-y-1">
                            {[1, 2, 3].map((i) => (
                              <Skeleton key={i} className="h-8 w-full" />
                            ))}
                          </div>
                        ) : hookData?.error ? (
                          <div className="text-red-500 text-xs p-2">
                            Error loading subcategories
                          </div>
                        ) : (
                          subCategories.map((subCat) => (
                            <div key={subCat.entity_id} className="space-y-1">
                              <div
                                onClick={() => {
                                  if (isMobile) {
                                    handleMobileSubCategorySelect(
                                      subCat.entity_id
                                    );
                                  } else {
                                    handleSubCategoryClick(subCat.entity_id);
                                  }
                                }}
                                className={cn(
                                  "p-1.5 rounded cursor-pointer text-sm flex items-center justify-between transition-colors",
                                  selectedSubCategoryId === subCat.entity_id
                                    ? "bg-red-50 text-red-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                )}
                              >
                                <span>{subCat.name}</span>
                                {subCat.has_children && (
                                  <ChevronDown
                                    className={cn(
                                      "w-3 h-3 transition-transform duration-200",
                                      selectedSubCategoryId ===
                                        subCat.entity_id && "rotate-180"
                                    )}
                                  />
                                )}
                              </div>

                              {selectedSubCategoryId === subCat.entity_id && (
                                <div className="ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                  {nestedSubCategoriesLoading ? (
                                    <div className="space-y-1">
                                      {[1, 2].map((i) => (
                                        <Skeleton
                                          key={i}
                                          className="h-6 w-full"
                                        />
                                      ))}
                                    </div>
                                  ) : nestedSubCategoriesError ? (
                                    <div className="text-red-500 text-xs p-2">
                                      Error loading nested categories
                                    </div>
                                  ) : (
                                    nestedSubCategories.map((nestedSubCat) => (
                                      <div
                                        key={nestedSubCat.entity_id}
                                        onClick={() =>
                                          isMobile
                                            ? handleMobileNestedSubCategorySelect(
                                                nestedSubCat.entity_id
                                              )
                                            : handleNestedSubCategoryClick(
                                                nestedSubCat.entity_id
                                              )
                                        }
                                        className={cn(
                                          "p-1 rounded cursor-pointer text-xs transition-colors",
                                          selectedNestedSubCategoryId ===
                                            nestedSubCat.entity_id
                                            ? "bg-red-50 text-red-700 font-medium"
                                            : "text-gray-600 hover:bg-gray-50"
                                        )}
                                      >
                                        {nestedSubCat.name}
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (pagination && (page < 1 || page > pagination.pages)) {
        return;
      }
      console.log("📄 Page changed to:", page);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [pagination]
  );

  const generatePaginationNumbers = useCallback(() => {
    if (!pagination || pagination.pages <= 1) return [];

    const totalPages = pagination.pages;
    const current = currentPage;
    const delta = 2;

    let pages: (number | string)[] = [];

    if (totalPages <= 7) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (current <= delta + 1) {
        pages = [
          ...Array.from({ length: delta + 2 }, (_, i) => i + 1),
          "...",
          totalPages,
        ];
      } else if (current >= totalPages - delta) {
        pages = [
          1,
          "...",
          ...Array.from(
            { length: delta + 2 },
            (_, i) => totalPages - delta - 1 + i
          ),
        ];
      } else {
        pages = [
          1,
          "...",
          ...Array.from(
            { length: delta * 2 + 1 },
            (_, i) => current - delta + i
          ),
          "...",
          totalPages,
        ];
      }
    }

    return pages;
  }, [pagination, currentPage]);

  // Error boundary for rendering
  if (productsError) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-12">
          <p className="text-red-500">
            Error loading products: {productsError.message}
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200 flex-shrink-0 h-full">
        <SidebarContent />
      </div>

      {/* Mobile Header with Filter Button */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <div className="flex items-center gap-3">
            <Link to="/store/cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Sheet
              open={isMobileSidebarOpen}
              onOpenChange={setIsMobileSidebarOpen}
            >
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <SidebarContent isMobile={true} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile breadcrumb */}
        {(selectedCategoryId ||
          selectedSubCategoryId ||
          selectedNestedSubCategoryId) && (
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedCategoryId && (
                <span className="font-medium">
                  {
                    STATIC_CATEGORIES.find(
                      (cat) => cat.entity_id === selectedCategoryId
                    )?.name
                  }
                </span>
              )}
              {selectedSubCategoryId && (
                <span>
                  {" > "}
                  <span className="font-medium">
                    {
                      subCategories.find(
                        (sub) => sub.entity_id === selectedSubCategoryId
                      )?.name
                    }
                  </span>
                </span>
              )}
              {selectedNestedSubCategoryId && (
                <span>
                  {" > "}
                  <span className="font-medium">
                    {
                      nestedSubCategories.find(
                        (nested) =>
                          nested.entity_id === selectedNestedSubCategoryId
                      )?.name
                    }
                  </span>
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              {pagination && (
                <p className="text-sm text-gray-500 mt-1">
                  Showing {(currentPage - 1) * 12 + 1}-
                  {Math.min(currentPage * 12, pagination.total || 0)} of{" "}
                  {pagination.total || 0} products
                </p>
              )}
            </div>
            <Link to="/store/cart">
              <Button variant="outline" className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cartCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Product Count */}
          <div className="lg:hidden mb-4">
            {pagination && (
              <p className="text-sm text-gray-500">
                {pagination.total || 0} products found
              </p>
            )}
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardHeader className="p-3 lg:p-4">
                    <Skeleton className="h-4 lg:h-6 w-3/4" />
                    <Skeleton className="h-3 lg:h-4 w-full" />
                  </CardHeader>
                  <CardContent className="p-3 lg:p-4 pt-0">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 lg:h-8 w-16 lg:w-20" />
                      <Skeleton className="h-6 lg:h-8 w-16 lg:w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {products.map((product) => {
                  const isThisProductLoading = loadingProductId === product.id;
                  const isThisProductUpdating =
                    updatingProductId === product.id;
                  const cartQuantity = getProductQuantityInCart(product.id);
                  const isInCart = cartQuantity > 0;

                  return (
                    <Card
                      key={product.id}
                      className="hover:shadow-lg transition-shadow overflow-hidden"
                    >
                      <div className="aspect-square relative overflow-hidden bg-gray-50">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const fallback =
                                target.nextElementSibling as HTMLElement;
                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            product.image ? "hidden" : "flex"
                          }`}
                        >
                          <div className="text-center p-4">
                            <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <Grid3X3 className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                              {product.manufacturer}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "absolute top-2 left-2 h-7 w-7 lg:h-8 lg:w-8 p-0 rounded-full bg-white shadow-sm",
                            isInWishlist(product.id) && "text-red-500"
                          )}
                          onClick={() => handleWishlistToggle(product)}
                          disabled={
                            isAddingToWishlist || isRemovingFromWishlist
                          }
                        >
                          <Heart
                            className={cn(
                              "w-3 h-3 lg:w-4 lg:h-4",
                              isInWishlist(product.id) && "fill-current"
                            )}
                          />
                        </Button>

                        {isInCart && (
                          <div className="absolute bottom-2 right-2">
                            <Badge className="bg-green-500 text-white text-xs">
                              {cartQuantity}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardHeader className="p-3 lg:p-4 pb-2 lg:pb-3">
                        <CardTitle className="text-sm lg:text-base leading-tight line-clamp-2">
                          {product.name}
                        </CardTitle>
                        {product.sku && (
                          <Badge variant="outline" className="text-xs w-fit">
                            SKU: {product.sku}
                          </Badge>
                        )}
                      </CardHeader>

                      <CardContent className="p-3 lg:p-4 pt-0">
                        <div className="flex gap-2 items-center">
                          <Link to={`/store/product/${product.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs flex-1 lg:flex-none"
                            >
                              View
                            </Button>
                          </Link>
                          <div className="flex items-center gap-1 bg-gray-50 rounded p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                cartQuantity === 0
                                  ? handleAddToCart(product)
                                  : handleUpdateCartQuantity(
                                      product,
                                      cartQuantity - 1
                                    )
                              }
                              disabled={
                                isThisProductUpdating || isThisProductLoading
                              }
                              className="h-6 w-6 p-0"
                            >
                              {cartQuantity === 0 ? (
                                <Plus className="w-3 h-3" />
                              ) : cartQuantity === 1 ? (
                                <X className="w-3 h-3" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                            </Button>

                            <span className="px-2 text-sm font-medium min-w-[1.5rem] text-center">
                              {isThisProductUpdating || isThisProductLoading ? (
                                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                cartQuantity
                              )}
                            </span>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                cartQuantity === 0
                                  ? handleAddToCart(product)
                                  : handleUpdateCartQuantity(
                                      product,
                                      cartQuantity + 1
                                    )
                              }
                              disabled={
                                isThisProductUpdating ||
                                isThisProductLoading ||
                                cartQuantity >= 99 ||
                                product.status === 0
                              }
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Responsive Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="mt-6 lg:mt-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="hidden sm:block text-sm text-gray-600">
                      Page {currentPage} of {pagination.pages}
                      {pagination.total && (
                        <span className="ml-2">
                          ({pagination.total} total products)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 lg:px-3"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Prev</span>
                      </Button>

                      <div className="flex gap-1">
                        {generatePaginationNumbers()
                          .slice(0, window.innerWidth < 640 ? 5 : undefined)
                          .map((page, index) => {
                            if (page === "...") {
                              return (
                                <span
                                  key={`ellipsis-${index}`}
                                  className="px-2 lg:px-3 py-2 text-gray-500 text-sm"
                                >
                                  ...
                                </span>
                              );
                            }

                            const pageNum = page as number;
                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className="min-w-[32px] px-2 lg:px-3"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                        className="px-2 lg:px-3"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="sm:hidden text-sm text-gray-600 text-center">
                      Page {currentPage} of {pagination.pages}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Grid3X3 className="w-12 h-12 lg:w-16 lg:h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-base lg:text-lg">
                No products found
              </p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
