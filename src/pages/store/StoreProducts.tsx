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
import { useToast } from "@/hooks/use-toast";
import {
  useProducts,
  useCategories,
  useSubCategories,
  useSearchProducts,
  useSearchSuggestions,
  Product,
  SearchProduct,
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
  Filter,
  Loader2,
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

export default function StoreProducts(): JSX.Element {
  // Category states
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    number | null
  >(null);
  const [selectedNestedSubCategoryId, setSelectedNestedSubCategoryId] =
    useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Simple search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // UI states
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(
    null
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);
  const [localQuantities, setLocalQuantities] = useState<{
    [key: number]: number;
  }>({});

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Simple debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get subcategories for selected category
  const { subCategories = [], isLoading: subCategoriesLoading = false } =
    useSubCategories(selectedCategoryId);

  // Get nested subcategories
  const {
    subCategories: nestedSubCategories = [],
    isLoading: nestedSubCategoriesLoading = false,
  } = useSubCategories(selectedSubCategoryId);

  // Always call hooks - fix the conditional hook issue
  const {
    searchResults = [],
    searchPagination,
    isLoading: searchLoading = false,
    error: searchError = null,
  } = useSearchProducts({
    query: isSearchMode ? searchQuery.trim() : "",
    max_results: 12,
    start_index: (currentPage - 1) * 12,
  });

  const { suggestions = [], isLoading: suggestionsLoading = false } =
    useSearchSuggestions(debouncedQuery.length >= 2 ? debouncedQuery : "", 5);

  // Regular products
  const productParams = useMemo(() => {
    if (isSearchMode) return null;

    const params: any = { page: currentPage, limit: 12 };
    if (selectedNestedSubCategoryId) {
      params.categoryId = selectedNestedSubCategoryId;
    } else if (selectedSubCategoryId) {
      params.categoryId = selectedSubCategoryId;
    } else if (selectedCategoryId) {
      params.categoryId = selectedCategoryId;
    }
    return params;
  }, [
    currentPage,
    selectedNestedSubCategoryId,
    selectedSubCategoryId,
    selectedCategoryId,
    isSearchMode,
  ]);

  const {
    products = [],
    pagination,
    isLoading: productsLoading = false,
    error: productsError = null,
  } = useProducts(productParams || {});

  const {
    addToCart,
    count: cartCount = 0,
    cartItems = [],
    updateCartItem,
    removeCartItem,
  } = useCart();

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Simple search input handler
  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      if (value.length >= 2 && !isSearchMode) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    },
    [isSearchMode]
  );

  // Simple search handler
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      return;
    }
    setIsSearchMode(true);
    setCurrentPage(1);
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedNestedSubCategoryId(null);
    setShowSuggestions(false);
  }, [searchQuery]);

  // Handle Enter key
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [handleSearch]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: any) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    setIsSearchMode(true);
    setCurrentPage(1);
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedNestedSubCategoryId(null);
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setIsSearchMode(false);
    setCurrentPage(1);
    setShowSuggestions(false);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedNestedSubCategoryId(null);
    setSearchQuery("");
    setIsSearchMode(false);
    setCurrentPage(1);
    setShowSuggestions(false);
  }, []);

  // Helper functions
  const getCartItemForProduct = useCallback(
    (productId: number) => {
      return cartItems.find((item) => item.product.id === productId);
    },
    [cartItems]
  );

  const getProductQuantityInCart = useCallback(
    (productId: number): number => {
      const cartItem = getCartItemForProduct(productId);
      return cartItem ? cartItem.quantity : 0;
    },
    [getCartItemForProduct]
  );

  const getLocalQuantity = useCallback(
    (productId: number): number => {
      return localQuantities[productId] || 1;
    },
    [localQuantities]
  );

  const updateLocalQuantity = useCallback(
    (productId: number, quantity: number) => {
      const clampedQuantity = Math.max(1, Math.min(99, quantity));
      setLocalQuantities((prev) => ({ ...prev, [productId]: clampedQuantity }));
    },
    []
  );

  // Convert SearchProduct to Product format
  const ensureProduct = useCallback(
    (product: Product | SearchProduct): Product => {
      if ("original_data" in product) {
        const id =
          typeof product.id === "string"
            ? parseInt(product.id, 10)
            : product.id;
        return {
          id,
          name: product.name,
          price: product.price || 0,
          sku: product.product_code || "",
          manufacturer: product.category || "",
          model: "",
          category_ids: [],
          weight: "",
          status: 1,
          description: product.description || "",
          badges: null,
          image: product.image || "",
        };
      }
      return product as Product;
    },
    []
  );

  // Cart operations
  const handleAddToCart = useCallback(
    async (product: Product | SearchProduct) => {
      const productToAdd = ensureProduct(product);
      const quantityToAdd = getLocalQuantity(productToAdd.id);
      setLoadingProductId(productToAdd.id);

      try {
        await addToCart(
          { product_id: productToAdd.id, quantity: quantityToAdd },
          {
            onSuccess: () => {
              toast({
                title: "Added to cart",
                description: `${quantityToAdd} x ${productToAdd.name} added to your cart`,
              });
              setLocalQuantities((prev) => {
                const { [productToAdd.id]: removed, ...rest } = prev;
                return rest;
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
    [addToCart, toast, getLocalQuantity, ensureProduct]
  );

  const handleUpdateCartQuantity = useCallback(
    async (product: Product | SearchProduct, newQuantity: number) => {
      const productToUpdate = ensureProduct(product);
      const cartItem = getCartItemForProduct(productToUpdate.id);
      if (!cartItem) return;

      if (newQuantity < 1) {
        setUpdatingProductId(productToUpdate.id);
        try {
          await removeCartItem(cartItem.id);
          toast({
            title: "Removed from cart",
            description: `${productToUpdate.name} has been removed from your cart`,
          });
        } finally {
          setUpdatingProductId(null);
        }
        return;
      }

      setUpdatingProductId(productToUpdate.id);
      try {
        await updateCartItem(cartItem.id, { quantity: newQuantity });
        toast({
          title: "Cart updated",
          description: `${productToUpdate.name} quantity updated`,
        });
      } finally {
        setUpdatingProductId(null);
      }
    },
    [
      getCartItemForProduct,
      updateCartItem,
      removeCartItem,
      toast,
      ensureProduct,
    ]
  );

  const handleWishlistToggle = useCallback(
    async (product: Product | SearchProduct) => {
      const productForWishlist = ensureProduct(product);
      const productId = productForWishlist.id;

      try {
        if (isInWishlist(productId)) {
          await removeFromWishlist(productId, {
            onSuccess: () =>
              toast({
                title: "Removed from wishlist",
                description: `${productForWishlist.name} has been removed from your wishlist`,
              }),
          });
        } else {
          await addToWishlist(
            { product_id: productId },
            {
              onSuccess: () =>
                toast({
                  title: "Added to wishlist",
                  description: `${productForWishlist.name} has been added to your wishlist`,
                }),
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
    [isInWishlist, removeFromWishlist, addToWishlist, toast, ensureProduct]
  );

  // Category handlers
  const handleCategoryClick = useCallback(
    (categoryId: number) => {
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
        setSelectedSubCategoryId(null);
        setSelectedNestedSubCategoryId(null);
      } else {
        setSelectedCategoryId(categoryId);
        setSelectedSubCategoryId(null);
        setSelectedNestedSubCategoryId(null);
      }
      setCurrentPage(1);
      setIsSearchMode(false);
    },
    [selectedCategoryId]
  );

  const handleSubCategoryClick = useCallback(
    (subCategoryId: number) => {
      setSelectedSubCategoryId(
        selectedSubCategoryId === subCategoryId ? null : subCategoryId
      );
      setSelectedNestedSubCategoryId(null);
      setCurrentPage(1);
    },
    [selectedSubCategoryId]
  );

  const handleNestedSubCategoryClick = useCallback(
    (nestedSubCategoryId: number) => {
      setSelectedNestedSubCategoryId(nestedSubCategoryId);
      setCurrentPage(1);
    },
    []
  );

  // Get display data
  const displayProducts = isSearchMode ? searchResults : products;
  const displayPagination = isSearchMode ? searchPagination : pagination;
  const displayLoading = isSearchMode ? searchLoading : productsLoading;
  const displayError = isSearchMode ? searchError : productsError;

  // Pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Simple sidebar component
  const SidebarContent: React.FC<{ isMobile?: boolean }> = ({
    isMobile = false,
  }) => (
    <div className="h-full flex flex-col">
      {/* Simple Search Section */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">Search Products</h2>

        <div className="relative">
          <TextField
            inputRef={searchInputRef}
            fullWidth
            size="small"
            placeholder="Search products..."
            value={searchQuery}
            autoFocus={true}
            onChange={handleSearchInputChange}
            onKeyDown={handleKeyPress}
            onFocus={() => {
              if (searchQuery.length >= 2 && !isSearchMode) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="w-4 h-4 text-gray-400" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <X className="w-4 h-4" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#dc2626" },
                "&.Mui-focused fieldset": { borderColor: "#dc2626" },
              },
            }}
          />

          {/* Simple Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {suggestionsLoading ? (
                <div className="p-3 text-center">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                </div>
              ) : suggestions.length > 0 ? (
                <div className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }}
                      className="p-2 hover:bg-gray-50 cursor-pointer text-sm rounded"
                    >
                      {suggestion.text}
                    </div>
                  ))}
                </div>
              ) : (
                debouncedQuery.length >= 2 && (
                  <div className="p-3 text-center text-sm text-gray-500">
                    No suggestions found
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700"
            size="sm"
          >
            Search
          </Button>
          {(isSearchMode || searchQuery) && (
            <Button variant="outline" onClick={handleClearSearch} size="sm">
              Clear
            </Button>
          )}
        </div>

        {isSearchMode && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
            <span className="text-blue-800">
              Results for: <strong>"{searchQuery}"</strong>
            </span>
          </div>
        )}
      </div>

      {/* Categories Section */}
      {!isSearchMode && (
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-medium text-gray-900 mb-3">Categories</h3>

          <div className="space-y-1">
            <div
              onClick={clearFilters}
              className={cn(
                "p-2 rounded cursor-pointer text-sm transition-colors",
                !selectedCategoryId
                  ? "bg-red-50 text-red-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              All Categories
            </div>

            {STATIC_CATEGORIES.map((category) => (
              <div key={category.entity_id} className="space-y-1">
                <div
                  onClick={() => handleCategoryClick(category.entity_id)}
                  className={cn(
                    "p-2 rounded cursor-pointer text-sm flex items-center justify-between transition-colors",
                    selectedCategoryId === category.entity_id
                      ? "bg-red-50 text-red-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span>{category.name}</span>
                  {category.has_children && (
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        selectedCategoryId === category.entity_id &&
                          "rotate-180"
                      )}
                    />
                  )}
                </div>

                {selectedCategoryId === category.entity_id && (
                  <div className="ml-4 space-y-1">
                    {subCategoriesLoading ? (
                      <div className="space-y-1">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-8 w-full" />
                        ))}
                      </div>
                    ) : (
                      subCategories.map((subCat) => (
                        <div key={subCat.entity_id} className="space-y-1">
                          <div
                            onClick={() =>
                              handleSubCategoryClick(subCat.entity_id)
                            }
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
                                  selectedSubCategoryId === subCat.entity_id &&
                                    "rotate-180"
                                )}
                              />
                            )}
                          </div>

                          {selectedSubCategoryId === subCat.entity_id && (
                            <div className="ml-4 space-y-1">
                              {nestedSubCategoriesLoading ? (
                                <div className="space-y-1">
                                  {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-6 w-full" />
                                  ))}
                                </div>
                              ) : (
                                nestedSubCategories.map((nestedSubCat) => (
                                  <div
                                    key={nestedSubCat.entity_id}
                                    onClick={() =>
                                      handleNestedSubCategoryClick(
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
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (displayError) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-12">
          <p className="text-red-500">
            Error loading products: {displayError.message}
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

      {/* Mobile Header */}
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
                  {isSearchMode ? "Search" : "Filters"}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>
                    {isSearchMode ? "Search Products" : "Filter Products"}
                  </SheetTitle>
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
              <h1 className="text-2xl font-bold text-gray-900">
                {isSearchMode ? `Search Results` : "Products"}
              </h1>
              {displayPagination && (
                <p className="text-sm text-gray-500 mt-1">
                  {isSearchMode
                    ? `${searchPagination?.total || 0} results found`
                    : `${pagination?.total || 0} products found`}
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
          {displayLoading ? (
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
          ) : displayProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {displayProducts.map((product, index) => {
                  const productId =
                    typeof product.id === "string"
                      ? parseInt(product.id, 10)
                      : product.id;
                  const isThisProductLoading = loadingProductId === productId;
                  const isThisProductUpdating = updatingProductId === productId;
                  const cartQuantity = getProductQuantityInCart(productId);
                  const isInCart = cartQuantity > 0;

                  return (
                    <Card
                      key={`${
                        isSearchMode ? "search" : "product"
                      }-${productId}-${index}`}
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
                              if (fallback) fallback.style.display = "flex";
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
                              {("manufacturer" in product
                                ? product.manufacturer
                                : product.category) || "Product"}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "absolute top-2 left-2 h-7 w-7 lg:h-8 lg:w-8 p-0 rounded-full bg-white shadow-sm",
                            isInWishlist(productId) && "text-red-500"
                          )}
                          onClick={() => handleWishlistToggle(product)}
                        >
                          <Heart
                            className={cn(
                              "w-3 h-3 lg:w-4 lg:h-4",
                              isInWishlist(productId) && "fill-current"
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

                        {isSearchMode && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-blue-500 text-white text-xs">
                              Search Result
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardHeader className="p-3 lg:p-4 pb-2 lg:pb-3">
                        <CardTitle className="text-sm lg:text-base leading-tight line-clamp-2">
                          {product.name}
                        </CardTitle>

                        {isSearchMode ? (
                          <div className="space-y-1">
                            {"product_code" in product &&
                              product.product_code && (
                                <Badge
                                  variant="outline"
                                  className="text-xs w-fit"
                                >
                                  Code: {product.product_code}
                                </Badge>
                              )}
                            {"category" in product && product.category && (
                              <Badge
                                variant="secondary"
                                className="text-xs w-fit"
                              >
                                {product.category}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          "sku" in product &&
                          product.sku && (
                            <Badge variant="outline" className="text-xs w-fit">
                              SKU: {product.sku}
                            </Badge>
                          )
                        )}
                      </CardHeader>

                      <CardContent className="p-3 lg:p-4 pt-0">
                        <div className="space-y-2">
                          <Link
                            to={`/store/product/${productId}`}
                            className="block"
                          >
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
                                        productId,
                                        getLocalQuantity(productId) - 1
                                      )
                                    }
                                    disabled={getLocalQuantity(productId) <= 1}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="px-3 py-1 bg-white rounded border text-sm font-medium min-w-[3rem] text-center">
                                    {getLocalQuantity(productId)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateLocalQuantity(
                                        productId,
                                        getLocalQuantity(productId) + 1
                                      )
                                    }
                                    disabled={getLocalQuantity(productId) >= 99}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              <Button
                                onClick={() => handleAddToCart(product)}
                                disabled={
                                  isThisProductLoading || isThisProductUpdating
                                }
                                size="sm"
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                              >
                                {isThisProductLoading ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Adding...
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    Add {getLocalQuantity(productId)} to Cart
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
                                  disabled={
                                    isThisProductUpdating ||
                                    isThisProductLoading
                                  }
                                  className="h-7 w-7 p-0"
                                >
                                  {cartQuantity === 1 ? (
                                    <X className="w-3 h-3" />
                                  ) : (
                                    <Minus className="w-3 h-3" />
                                  )}
                                </Button>
                                <span className="px-3 py-1 bg-white rounded border text-sm font-medium min-w-[3rem] text-center">
                                  {isThisProductUpdating ||
                                  isThisProductLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin mx-auto" />
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
                                    isThisProductUpdating ||
                                    isThisProductLoading ||
                                    cartQuantity >= 99
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

              {/* Simple Pagination */}
              {displayPagination && (
                <div className="mt-6 lg:mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <span className="px-4 py-2 text-sm">
                      Page {currentPage} of{" "}
                      {isSearchMode
                        ? Math.ceil(
                            (searchPagination?.total || 0) /
                              (searchPagination?.max_results || 12)
                          )
                        : pagination?.pages || 1}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        isSearchMode
                          ? currentPage >=
                            Math.ceil(
                              (searchPagination?.total || 0) /
                                (searchPagination?.max_results || 12)
                            )
                          : currentPage === (pagination?.pages || 1)
                      }
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Grid3X3 className="w-12 h-12 lg:w-16 lg:h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-base lg:text-lg">
                {isSearchMode
                  ? `No products found for "${searchQuery}"`
                  : "No products found"}
              </p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                {isSearchMode ? "Clear Search" : "Clear Filters"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
