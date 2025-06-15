import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { STATIC_CATEGORIES } from "@/db";
import { Tabs, Tab, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

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

  const { toast } = useToast();

  // Fetch subcategories
  const { subCategories, isLoading: subCategoriesLoading } = useSubCategories(
    selectedCategoryId || 0
  );

  // Fetch nested subcategories
  const {
    subCategories: nestedSubCategories,
    isLoading: nestedSubCategoriesLoading,
  } = useSubCategories(selectedSubCategoryId || 0);

  // Create searchable category data
  const allCategoryData = useMemo(() => {
    const allData: any[] = [];

    // Add main categories
    STATIC_CATEGORIES.forEach((cat) => {
      allData.push({
        id: cat.entity_id,
        name: cat.name,
        type: "category",
        level: 1,
        fullPath: cat.name,
        searchTerms: cat.name.toLowerCase(),
      });
    });

    // Add subcategories
    subCategories.forEach((subCat) => {
      const parentCategory = STATIC_CATEGORIES.find(
        (cat) => cat.entity_id === selectedCategoryId
      );
      if (parentCategory) {
        allData.push({
          id: subCat.entity_id,
          name: subCat.name,
          type: "subcategory",
          level: 2,
          fullPath: `${parentCategory.name} > ${subCat.name}`,
          parentId: selectedCategoryId,
          searchTerms: `${parentCategory.name} ${subCat.name}`.toLowerCase(),
        });
      }
    });

    // Add nested subcategories
    nestedSubCategories.forEach((nestedSubCat) => {
      const parentCategory = STATIC_CATEGORIES.find(
        (cat) => cat.entity_id === selectedCategoryId
      );
      const parentSubCategory = subCategories.find(
        (sub) => sub.entity_id === selectedSubCategoryId
      );
      if (parentCategory && parentSubCategory) {
        allData.push({
          id: nestedSubCat.entity_id,
          name: nestedSubCat.name,
          type: "nestedSubcategory",
          level: 3,
          fullPath: `${parentCategory.name} > ${parentSubCategory.name} > ${nestedSubCat.name}`,
          parentId: selectedSubCategoryId,
          grandParentId: selectedCategoryId,
          searchTerms:
            `${parentCategory.name} ${parentSubCategory.name} ${nestedSubCat.name}`.toLowerCase(),
        });
      }
    });

    return allData;
  }, [
    subCategories,
    nestedSubCategories,
    selectedCategoryId,
    selectedSubCategoryId,
  ]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allCategoryData.filter((item) => item.searchTerms.includes(query));
  }, [allCategoryData, searchQuery]);

  // Fetch products
  const {
    products,
    pagination,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts({
    page: currentPage,
    limit: 12,
    categoryId:
      selectedNestedSubCategoryId || selectedSubCategoryId || undefined,
  });

  const {
    addToCart,
    count: cartCount,
    cartItems,
    updateCartItem,
    removeCartItem,
  } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isAddingToWishlist,
    isRemovingFromWishlist,
  } = useWishlist();

  const categories = STATIC_CATEGORIES.map((cat) => ({
    id: cat.entity_id.toString(),
    name: cat.name,
    has_children: cat.has_children,
    image_url: cat.image_url,
  }));

  // Helper functions
  const getCartItemForProduct = (productId: number) => {
    return cartItems.find((item) => item.product.id === productId);
  };

  const getProductQuantityInCart = (productId: number) => {
    const cartItem = getCartItemForProduct(productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (product: Product) => {
    setLoadingProductId(product.id);
    addToCart(
      { product_id: product.id, quantity: 1 },
      {
        onSuccess: () => {
          toast({
            title: "Added to cart",
            description: `${product.name} has been added to your cart`,
          });
          setLoadingProductId(null);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to add product to cart",
            variant: "destructive",
          });
          setLoadingProductId(null);
        },
      }
    );
  };

  const handleUpdateCartQuantity = async (
    product: Product,
    newQuantity: number
  ) => {
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
        description: error.message || "Failed to update cart",
        variant: "destructive",
      });
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleRemoveFromCart = async (product: Product) => {
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
        description: error.message || "Failed to remove from cart",
        variant: "destructive",
      });
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleWishlistToggle = (product: Product) => {
    const productId = product.id;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId, {
        onSuccess: () => {
          toast({
            title: "Removed from wishlist",
            description: `${product.name} has been removed from your wishlist`,
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to remove from wishlist",
            variant: "destructive",
          });
        },
      });
    } else {
      addToWishlist(
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
              description: error.message || "Failed to add to wishlist",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  const handleCategoryChange = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    if (newValue === "all") {
      setSelectedCategoryId(null);
      setSelectedSubCategoryId(null);
      setSelectedNestedSubCategoryId(null);
      setExpandedCategory(null);
    } else {
      const numCategoryId = parseInt(newValue);
      setSelectedCategoryId(numCategoryId);
      setSelectedSubCategoryId(null);
      setSelectedNestedSubCategoryId(null);
      setExpandedCategory(newValue);
    }
    setCurrentPage(1);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubCategoryClick = (subCategoryId: number) => {
    if (selectedSubCategoryId === subCategoryId) {
      setSelectedSubCategoryId(null);
      setSelectedNestedSubCategoryId(null);
    } else {
      setSelectedSubCategoryId(subCategoryId);
      setSelectedNestedSubCategoryId(null);
    }
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNestedSubCategoryClick = (nestedSubCategoryId: number) => {
    setSelectedNestedSubCategoryId(nestedSubCategoryId);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchResultClick = (item: any) => {
    setSearchQuery("");
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

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedNestedSubCategoryId(null);
    setExpandedCategory(null);
    setSearchQuery("");
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (pagination && (page < 1 || page > pagination.pages)) {
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generatePaginationNumbers = () => {
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
  };

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
    <div className="flex h-full bg-gray-50">
      {/* Simple Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 h-10 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results */}
          {searchQuery && filteredCategories.length > 0 && (
            <div className="mb-4 max-h-64 overflow-y-auto">
              <div className="text-xs text-gray-500 mb-2">Search Results</div>
              {filteredCategories.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSearchResultClick(item)}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer text-sm"
                >
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.fullPath}</div>
                </div>
              ))}
            </div>
          )}

          {/* Category List */}
          {!searchQuery && (
            <div className="space-y-1">
              <div
                onClick={() => clearFilters()}
                className={cn(
                  "p-2 rounded cursor-pointer text-sm",
                  !selectedCategoryId
                    ? "bg-red-50 text-red-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                All Categories
              </div>

              {categories.map((category) => (
                <div key={category.id}>
                  <div
                    onClick={() => handleCategoryChange({} as any, category.id)}
                    className={cn(
                      "p-2 rounded cursor-pointer text-sm flex items-center justify-between",
                      selectedCategoryId?.toString() === category.id
                        ? "bg-red-50 text-red-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span>{category.name}</span>
                    {category.has_children &&
                      selectedCategoryId?.toString() === category.id && (
                        <ChevronDown className="w-4 h-4" />
                      )}
                  </div>

                  {/* Subcategories */}
                  {selectedCategoryId?.toString() === category.id && (
                    <div className="ml-4 mt-1 space-y-1">
                      {subCategoriesLoading ? (
                        <div className="space-y-1">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                          ))}
                        </div>
                      ) : (
                        subCategories.map((subCat) => (
                          <div key={subCat.entity_id}>
                            <div
                              onClick={() =>
                                handleSubCategoryClick(subCat.entity_id)
                              }
                              className={cn(
                                "p-1.5 rounded cursor-pointer text-sm flex items-center justify-between",
                                selectedSubCategoryId === subCat.entity_id
                                  ? "bg-red-50 text-red-700 font-medium"
                                  : "text-gray-600 hover:bg-gray-50"
                              )}
                            >
                              <span>{subCat.name}</span>
                              {subCat.has_children &&
                                selectedSubCategoryId === subCat.entity_id && (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                            </div>

                            {/* Nested Subcategories */}
                            {selectedSubCategoryId === subCat.entity_id && (
                              <div className="ml-4 mt-1 space-y-1">
                                {nestedSubCategoriesLoading ? (
                                  <div className="space-y-1">
                                    {[1, 2].map((i) => (
                                      <Skeleton
                                        key={i}
                                        className="h-6 w-full"
                                      />
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
                                        "p-1 rounded cursor-pointer text-xs",
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
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                            <div className="w-16 h-16 mx-auto mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <Grid3X3 className="w-8 h-8 text-gray-400" />
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
                            "absolute top-2 left-2 h-8 w-8 p-0 rounded-full bg-white shadow-sm",
                            isInWishlist(product.id) && "text-red-500"
                          )}
                          onClick={() => handleWishlistToggle(product)}
                          disabled={
                            isAddingToWishlist || isRemovingFromWishlist
                          }
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
                              {cartQuantity} in cart
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm leading-tight line-clamp-2">
                          {product.name}
                        </CardTitle>
                        {product.sku && (
                          <Badge variant="outline" className="text-xs w-fit">
                            SKU: {product.sku}
                          </Badge>
                        )}
                      </CardHeader>

                      <CardContent>
                        <div className="flex gap-2 items-center">
                          <Link to={`/store/product/${product.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
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

              {/* Simple Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex gap-1">
                      {generatePaginationNumbers().map((page, index) => {
                        if (page === "...") {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-3 py-2 text-gray-500"
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
                              currentPage === pageNum ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="min-w-[32px]"
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
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Grid3X3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No products found</p>
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
