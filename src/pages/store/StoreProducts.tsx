import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useProducts, useSubCategories, Product } from "@/hooks/useProducts";
import { useCart, useWishlist } from "@/hooks/useCart";
import {
  ShoppingCart,
  ChevronDown,
  Grid3X3,
  X,
  Heart,
  Plus,
  ChevronLeft,
  Search,
  Minus,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { STATIC_CATEGORIES } from "@/db";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CategoryItem {
  id: number;
  name: string;
  type: "category" | "subcategory" | "nestedSubcategory";
  fullPath: string;
  searchTerms: string;
  parentId?: number;
  grandParentId?: number;
}

export default function StoreProducts() {
  // Basic state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    number | null
  >(null);
  const [selectedNestedSubCategoryId, setSelectedNestedSubCategoryId] =
    useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [localQuantities, setLocalQuantities] = useState<
    Record<number, number>
  >({});
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(
    null
  );

  // Search data
  const [allCategoriesData, setAllCategoriesData] = useState<CategoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Hooks for UI display
  const allCategoryHooks = STATIC_CATEGORIES.map((category) =>
    useSubCategories(category.entity_id)
  );

  const selectedCategoryData = allCategoryHooks.find(
    (_, index) => STATIC_CATEGORIES[index].entity_id === selectedCategoryId
  );
  const subCategories = selectedCategoryData?.subCategories || [];

  const { subCategories: nestedSubCategories = [] } = useSubCategories(
    selectedSubCategoryId && selectedSubCategoryId > 0
      ? selectedSubCategoryId
      : null
  );

  // Fetch all category data
  const fetchAllCategories = async () => {
    setIsLoading(true);
    const allData: CategoryItem[] = [];

    try {
      // Add main categories
      STATIC_CATEGORIES.forEach((cat) => {
        allData.push({
          id: cat.entity_id,
          name: cat.name,
          type: "category",
          fullPath: cat.name,
          searchTerms: cat.name.toLowerCase(),
        });
      });

      // Fetch subcategories
      for (const category of STATIC_CATEGORIES) {
        try {
          const response = await fetch(
            `/api/categories/${category.entity_id}/subcategories`
          );
          if (response.ok) {
            const data = await response.json();
            const subcategories = data.subcategories || [];

            subcategories.forEach((subCat: any) => {
              allData.push({
                id: subCat.entity_id,
                name: subCat.name,
                type: "subcategory",
                fullPath: `${category.name} > ${subCat.name}`,
                searchTerms: `${category.name} ${subCat.name}`.toLowerCase(),
                parentId: category.entity_id,
              });
            });

            // Fetch nested subcategories
            for (const subCat of subcategories) {
              try {
                const nestedResponse = await fetch(
                  `/api/categories/${subCat.entity_id}/subcategories`
                );
                if (nestedResponse.ok) {
                  const nestedData = await nestedResponse.json();
                  const nestedSubcategories = nestedData.subcategories || [];

                  nestedSubcategories.forEach((nestedSubCat: any) => {
                    allData.push({
                      id: nestedSubCat.entity_id,
                      name: nestedSubCat.name,
                      type: "nestedSubcategory",
                      fullPath: `${category.name} > ${subCat.name} > ${nestedSubCat.name}`,
                      searchTerms:
                        `${category.name} ${subCat.name} ${nestedSubCat.name}`.toLowerCase(),
                      parentId: subCat.entity_id,
                      grandParentId: category.entity_id,
                    });
                  });
                }
              } catch (error) {
                console.error(
                  `Error fetching nested for ${subCat.name}:`,
                  error
                );
              }
            }
          }
        } catch (error) {
          console.error(
            `Error fetching subcategories for ${category.name}:`,
            error
          );
        }
      }

      setAllCategoriesData(allData);
      console.log(`Loaded ${allData.length} total categories for search`);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Search functionality
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    return allCategoriesData
      .filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.searchTerms.includes(query) ||
          item.fullPath.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const aExact = a.name.toLowerCase() === query;
        const bExact = b.name.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.name.length - b.name.length;
      });
  }, [allCategoriesData, searchQuery]);

  // Product fetching
  const productParams = useMemo(() => {
    const params: any = { page: currentPage, limit: 12 };
    if (selectedNestedSubCategoryId)
      params.categoryId = selectedNestedSubCategoryId;
    else if (selectedSubCategoryId) params.categoryId = selectedSubCategoryId;
    else if (selectedCategoryId) params.categoryId = selectedCategoryId;
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
    isLoading: productsLoading,
  } = useProducts(productParams);
  const {
    addToCart,
    count: cartCount = 0,
    cartItems = [],
    updateCartItem,
    removeCartItem,
  } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Helper functions
  const getCartItemForProduct = useCallback(
    (productId: number) =>
      cartItems.find((item) => item.product.id === productId),
    [cartItems]
  );

  const getProductQuantityInCart = useCallback(
    (productId: number) => {
      const cartItem = getCartItemForProduct(productId);
      return cartItem ? cartItem.quantity : 0;
    },
    [getCartItemForProduct]
  );

  const getLocalQuantity = useCallback(
    (productId: number) => localQuantities[productId] || 1,
    [localQuantities]
  );

  const updateLocalQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity < 1) quantity = 1;
      if (quantity > 99) quantity = 99;
      setLocalQuantities((prev) => ({ ...prev, [productId]: quantity }));
    },
    []
  );

  // Event handlers
  const handleAddToCart = useCallback(
    async (product: Product) => {
      if (!product?.id) return;
      const quantityToAdd = getLocalQuantity(product.id);
      setLoadingProductId(product.id);

      try {
        await addToCart(
          { product_id: product.id, quantity: quantityToAdd },
          {
            onSuccess: () => {
              toast({
                title: "Added to cart",
                description: `${quantityToAdd} x ${product.name} added`,
              });
              setLocalQuantities((prev) => {
                const newState = { ...prev };
                delete newState[product.id];
                return newState;
              });
            },
            onError: (error: any) => {
              toast({
                title: "Error",
                description: error?.message || "Failed to add to cart",
                variant: "destructive",
              });
            },
          }
        );
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to add to cart",
          variant: "destructive",
        });
      } finally {
        setLoadingProductId(null);
      }
    },
    [addToCart, toast, getLocalQuantity]
  );

  const handleUpdateCartQuantity = useCallback(
    async (product: Product, newQuantity: number) => {
      if (!product?.id) return;
      const cartItem = getCartItemForProduct(product.id);
      if (!cartItem) return;

      if (newQuantity < 1) {
        setUpdatingProductId(product.id);
        try {
          await removeCartItem(cartItem.id);
          toast({
            title: "Removed from cart",
            description: `${product.name} removed`,
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to remove from cart",
            variant: "destructive",
          });
        } finally {
          setUpdatingProductId(null);
        }
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
          description: "Failed to update cart",
          variant: "destructive",
        });
      } finally {
        setUpdatingProductId(null);
      }
    },
    [getCartItemForProduct, updateCartItem, removeCartItem, toast]
  );

  const handleWishlistToggle = useCallback(
    async (product: Product) => {
      if (!product?.id) return;
      const productId = product.id;

      try {
        if (isInWishlist(productId)) {
          await removeFromWishlist(productId, {
            onSuccess: () =>
              toast({
                title: "Removed from wishlist",
                description: `${product.name} removed`,
              }),
            onError: (error: any) =>
              toast({
                title: "Error",
                description: "Failed to remove from wishlist",
                variant: "destructive",
              }),
          });
        } else {
          await addToWishlist(
            { product_id: productId },
            {
              onSuccess: () =>
                toast({
                  title: "Added to wishlist",
                  description: `${product.name} added`,
                }),
              onError: (error: any) =>
                toast({
                  title: "Error",
                  description: "Failed to add to wishlist",
                  variant: "destructive",
                }),
            }
          );
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update wishlist",
          variant: "destructive",
        });
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist, toast]
  );

  const handleSearchResultClick = useCallback((item: CategoryItem) => {
    if (item.type === "category") {
      setSelectedCategoryId(item.id);
      setSelectedSubCategoryId(null);
      setSelectedNestedSubCategoryId(null);
    } else if (item.type === "subcategory") {
      setSelectedCategoryId(item.parentId || null);
      setSelectedSubCategoryId(item.id);
      setSelectedNestedSubCategoryId(null);
    } else if (item.type === "nestedSubcategory") {
      setSelectedCategoryId(item.grandParentId || null);
      setSelectedSubCategoryId(item.parentId || null);
      setSelectedNestedSubCategoryId(item.id);
    }
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedNestedSubCategoryId(null);
    setSearchQuery("");
    setCurrentPage(1);
    setIsMobileSidebarOpen(false);
  }, []);

  const SidebarContent = React.memo(
    ({ isMobile = false }: { isMobile?: boolean }) => (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>

          <TextField
            inputRef={isMobile ? mobileSearchInputRef : searchInputRef}
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="w-4 h-4 text-gray-400" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery("")} size="small">
                    <X className="w-4 h-4" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {isLoading && (
            <div className="mt-2 text-xs text-blue-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Loading all categories...</span>
              </div>
            </div>
          )}

          {!isLoading && (
            <div className="mt-2 text-xs text-green-600">
              ✅ {allCategoriesData.length} categories loaded
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Search Results */}
          {searchQuery && filteredCategories.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 mb-2">
                Search Results ({filteredCategories.length})
              </div>
              {filteredCategories.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    handleSearchResultClick(item);
                    if (isMobile) setIsMobileSidebarOpen(false);
                  }}
                  className="p-3 hover:bg-gray-50 rounded cursor-pointer border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-blue-600 mt-1 truncate">
                        {item.fullPath}
                      </div>
                    </div>
                    <Badge
                      className={`ml-2 text-xs ${
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
                        ? "Sub"
                        : "Nested"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No search results */}
          {searchQuery && filteredCategories.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">
                No categories found for "{searchQuery}"
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-blue-600 mt-2"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Category Tree */}
          {!searchQuery && (
            <div className="space-y-1">
              <div
                onClick={() => (isMobile ? clearFilters() : clearFilters())}
                className={cn(
                  "p-2 rounded cursor-pointer text-sm",
                  !selectedCategoryId
                    ? "bg-red-50 text-red-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                All Categories
              </div>

              {STATIC_CATEGORIES.map((category, index) => {
                const categoryId = category.entity_id;
                const hookData = allCategoryHooks[index];
                const isExpanded = selectedCategoryId === categoryId;

                return (
                  <div key={category.entity_id}>
                    <div
                      onClick={() => {
                        if (isMobile) {
                          setSelectedCategoryId(categoryId);
                          setSelectedSubCategoryId(null);
                          setSelectedNestedSubCategoryId(null);
                          setIsMobileSidebarOpen(false);
                        } else {
                          setSelectedCategoryId(isExpanded ? null : categoryId);
                          setSelectedSubCategoryId(null);
                          setSelectedNestedSubCategoryId(null);
                        }
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "p-2 rounded cursor-pointer text-sm flex items-center justify-between",
                        isExpanded
                          ? "bg-red-50 text-red-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <span>{category.name}</span>
                      {category.has_children && (
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      )}
                    </div>

                    {isExpanded && (
                      <div className="ml-4 space-y-1 mt-1">
                        {hookData?.isLoading ? (
                          <div className="space-y-1">
                            {[1, 2, 3].map((i) => (
                              <Skeleton key={i} className="h-8 w-full" />
                            ))}
                          </div>
                        ) : (
                          subCategories.map((subCat) => (
                            <div key={subCat.entity_id}>
                              <div
                                onClick={() => {
                                  if (isMobile) {
                                    setSelectedSubCategoryId(subCat.entity_id);
                                    setSelectedNestedSubCategoryId(null);
                                    setIsMobileSidebarOpen(false);
                                  } else {
                                    setSelectedSubCategoryId(
                                      selectedSubCategoryId === subCat.entity_id
                                        ? null
                                        : subCat.entity_id
                                    );
                                    setSelectedNestedSubCategoryId(null);
                                  }
                                  setCurrentPage(1);
                                }}
                                className={cn(
                                  "p-1.5 rounded cursor-pointer text-sm flex items-center justify-between",
                                  selectedSubCategoryId === subCat.entity_id
                                    ? "bg-red-50 text-red-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                )}
                              >
                                <span>{subCat.name}</span>
                                {subCat.has_children && (
                                  <ChevronDown
                                    className={cn(
                                      "w-3 h-3 transition-transform",
                                      selectedSubCategoryId ===
                                        subCat.entity_id && "rotate-180"
                                    )}
                                  />
                                )}
                              </div>

                              {selectedSubCategoryId === subCat.entity_id && (
                                <div className="ml-4 space-y-1 mt-1">
                                  {nestedSubCategories.map((nested) => (
                                    <div
                                      key={nested.entity_id}
                                      onClick={() => {
                                        setSelectedNestedSubCategoryId(
                                          nested.entity_id
                                        );
                                        setCurrentPage(1);
                                        if (isMobile)
                                          setIsMobileSidebarOpen(false);
                                      }}
                                      className={cn(
                                        "p-1 rounded cursor-pointer text-xs",
                                        selectedNestedSubCategoryId ===
                                          nested.entity_id
                                          ? "bg-red-50 text-red-700 font-medium"
                                          : "text-gray-600 hover:bg-gray-50"
                                      )}
                                    >
                                      {nested.name}
                                    </div>
                                  ))}
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

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200 h-full">
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <div className="flex items-center gap-3">
            <Link to="/store/cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">
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
      </div>

      {/* Main Content */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => {
                const isThisProductLoading = loadingProductId === product.id;
                const isThisProductUpdating = updatingProductId === product.id;
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
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Grid3X3 className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "absolute top-2 left-2 h-8 w-8 p-0 rounded-full bg-white shadow-sm",
                          isInWishlist(product.id) && "text-red-500"
                        )}
                        onClick={() => handleWishlistToggle(product)}
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4",
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

                    <CardHeader className="p-3 lg:p-4 pb-2">
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
                      <div className="space-y-2">
                        <Link to={`/store/product/${product.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                          >
                            View Details
                          </Button>
                        </Link>

                        {!isInCart ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between bg-gray-50 rounded p-2">
                              <span className="text-sm font-medium text-gray-700">
                                Quantity:
                              </span>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    updateLocalQuantity(
                                      product.id,
                                      getLocalQuantity(product.id) - 1
                                    )
                                  }
                                  disabled={getLocalQuantity(product.id) <= 1}
                                  className="h-7 w-7 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="px-3 py-1 bg-white rounded border text-sm font-medium min-w-[3rem] text-center">
                                  {getLocalQuantity(product.id)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    updateLocalQuantity(
                                      product.id,
                                      getLocalQuantity(product.id) + 1
                                    )
                                  }
                                  disabled={getLocalQuantity(product.id) >= 99}
                                  className="h-7 w-7 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={
                                isThisProductLoading || product.status === 0
                              }
                              size="sm"
                              className="w-full bg-red-600 hover:bg-red-700 text-white"
                            >
                              {isThisProductLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Adding...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <ShoppingCart className="w-4 h-4" />
                                  Add {getLocalQuantity(product.id)} to Cart
                                </div>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-green-50 rounded p-2 border border-green-200">
                            <span className="text-sm font-medium text-green-700">
                              In Cart:
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleUpdateCartQuantity(
                                    product,
                                    cartQuantity - 1
                                  )
                                }
                                disabled={isThisProductUpdating}
                                className="h-7 w-7 p-0"
                              >
                                {cartQuantity === 1 ? (
                                  <X className="w-3 h-3" />
                                ) : (
                                  <Minus className="w-3 h-3" />
                                )}
                              </Button>
                              <span className="px-3 py-1 bg-white rounded border text-sm font-medium min-w-[3rem] text-center">
                                {isThisProductUpdating ? (
                                  <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                ) : (
                                  cartQuantity
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleUpdateCartQuantity(
                                    product,
                                    cartQuantity + 1
                                  )
                                }
                                disabled={
                                  isThisProductUpdating || cartQuantity >= 99
                                }
                                className="h-7 w-7 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Grid3X3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No products found</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {currentPage} of {pagination.pages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
