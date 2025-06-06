import React, { useState } from "react";
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
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Material-UI imports
import { Tabs, Tab, Box, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";

// Styled MUI components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 48,
  width: "100%",
  "& .MuiTabs-scrollButtons": {
    "&.Mui-disabled": {
      opacity: 0.3,
    },
  },
  "& .MuiTabs-indicator": {
    backgroundColor: "hsl(var(--primary))",
    height: 3,
  },
  "& .MuiTabs-scroller": {
    overflow: "hidden !important",
  },
  "& .MuiTabs-flexContainer": {
    overflow: "hidden",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  minWidth: 120,
  maxWidth: 200,
  fontWeight: 500,
  fontSize: "14px",
  padding: "12px 16px",
  color: "hsl(var(--muted-foreground))",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  "&.Mui-selected": {
    color: "hsl(var(--foreground))",
    fontWeight: 600,
  },
  "&:hover": {
    color: "hsl(var(--foreground))",
    backgroundColor: "hsl(var(--accent))",
  },
}));

export default function StoreProducts() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    number | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add state to track which product is being added to cart
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);

  const { toast } = useToast();

  const { categories, isLoading: categoriesLoading } = useCategories();
  const { subCategories, isLoading: subCategoriesLoading } = useSubCategories(
    selectedCategoryId || 0
  );

  const {
    products,
    pagination,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts({
    page: currentPage,
    limit: 12,
    categoryId: selectedSubCategoryId || selectedCategoryId || undefined,
    // search: searchQuery || undefined,
  });

  const { addToCart, count: cartCount } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isAddingToWishlist,
    isRemovingFromWishlist,
  } = useWishlist();

  const handleAddToCart = (product: Product) => {
    // Set loading state for this specific product
    setLoadingProductId(product.id);

    addToCart(
      {
        product_id: product.id,
        quantity: 1,
      },
      {
        onSuccess: () => {
          toast({
            title: "Added to cart",
            description: `${product.name} has been added to your cart`,
          });
          // Clear loading state
          setLoadingProductId(null);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to add product to cart",
            variant: "destructive",
          });
          // Clear loading state
          setLoadingProductId(null);
        },
      }
    );
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
      setExpandedCategory(null);
    } else {
      const numCategoryId = parseInt(newValue);
      setSelectedCategoryId(numCategoryId);
      setSelectedSubCategoryId(null);
      setExpandedCategory(newValue);
    }

    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubCategoryClick = (subCategoryId: number) => {
    setSelectedSubCategoryId(subCategoryId);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setExpandedCategory(null);
    setSearchQuery("");
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    // Clear category selection when searching
    if (e.target.value) {
      setSelectedCategoryId(null);
      setSelectedSubCategoryId(null);
      setExpandedCategory(null);
    }
  };

  const getSelectedCategoryName = () => {
    if (selectedSubCategoryId) {
      const subCategory = subCategories.find(
        (sub) => sub.entity_id === selectedSubCategoryId
      );
      if (subCategory) {
        const parentCategory = categories.find(
          (cat) => parseInt(cat.id) === selectedCategoryId
        );
        return `${parentCategory?.name} > ${subCategory.name}`;
      }
    }
    if (selectedCategoryId) {
      const category = categories.find(
        (cat) => parseInt(cat.id) === selectedCategoryId
      );
      return category?.name;
    }
    return null;
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
    <div className="px-4 py-6 w-full max-w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Browse our product catalog</p>
          {pagination && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {(currentPage - 1) * 12 + 1}-
              {Math.min(currentPage * 12, pagination.total || 0)} of{" "}
              {pagination.total || 0} products
            </p>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
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
      </div>

      {/* Search Bar */}

      {/* Categories Section */}
      <Card className="mb-6 w-full max-w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              Categories
            </CardTitle>
            {(selectedCategoryId || selectedSubCategoryId || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
          {(getSelectedCategoryName() || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {getSelectedCategoryName() && (
                <Badge variant="secondary" className="w-fit">
                  {getSelectedCategoryName()}
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="w-fit">
                  Search: "{searchQuery}"
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="w-full max-w-full overflow-hidden">
          {categoriesLoading ? (
            <div className="flex gap-3 flex-wrap">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 w-32" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* MUI Scrollable Tabs for Categories */}
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <StyledTabs
                  value={selectedCategoryId?.toString() || "all"}
                  onChange={handleCategoryChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  aria-label="category tabs"
                  sx={{
                    width: "100%",
                    "& .MuiTabs-scroller": {
                      overflow: "hidden !important",
                    },
                    "& .MuiTabs-flexContainer": {
                      overflow: "hidden",
                    },
                  }}
                >
                  <StyledTab label="All Categories" value="all" />
                  {categories.map((category) => (
                    <StyledTab
                      key={category.id}
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {category.name}
                          {category.has_children && (
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform",
                                expandedCategory === category.id && "rotate-180"
                              )}
                            />
                          )}
                        </Box>
                      }
                      value={category.id}
                    />
                  ))}
                </StyledTabs>
              </Box>

              {selectedCategoryId && (
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {
                      categories.find(
                        (cat) => parseInt(cat.id) === selectedCategoryId
                      )?.name
                    }
                  </h3>
                  {/* <div className="mb-6">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="What are you looking for?"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-10 pr-10"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setCurrentPage(1);
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div> */}
                  {subCategoriesLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="p-4">
                          <Skeleton className="w-full h-20 mb-3" />
                          <Skeleton className="h-4 w-3/4" />
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {subCategories.map((subCategory) => (
                        <Card
                          key={subCategory.entity_id}
                          className={cn(
                            "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105",
                            selectedSubCategoryId === subCategory.entity_id
                              ? "ring-2 ring-primary bg-primary/5"
                              : "hover:bg-gray-50"
                          )}
                          onClick={() =>
                            handleSubCategoryClick(subCategory.entity_id)
                          }
                        >
                          <CardContent className="p-4 text-center">
                            <div className="w-full h-16 mb-3 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                              {subCategory.image_url ? (
                                <img
                                  src={subCategory.image_url}
                                  alt={subCategory.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    console.log(
                                      "Image failed to load:",
                                      subCategory.image_url
                                    );
                                    e.currentTarget.style.display = "none";
                                    const fallback = e.currentTarget
                                      .nextElementSibling as HTMLElement;
                                    if (fallback) {
                                      fallback.style.display = "flex";
                                    }
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center ${
                                  subCategory.image_url ? "hidden" : "flex"
                                }`}
                                style={{
                                  display: subCategory.image_url
                                    ? "none"
                                    : "flex",
                                }}
                              >
                                <Grid3X3 className="w-8 h-8 text-gray-400" />
                              </div>
                            </div>
                            <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                              {subCategory.name}
                            </h4>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCategoryId(null);
                        setSelectedSubCategoryId(null);
                        setExpandedCategory(null);
                        setCurrentPage(1);
                      }}
                    >
                      View all{" "}
                      {
                        categories.find(
                          (cat) => parseInt(cat.id) === selectedCategoryId
                        )?.name
                      }{" "}
                      products
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      {!selectedCategoryId || selectedSubCategoryId ? (
        <>
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-4 w-16 mt-1" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {products.map((product) => {
                  // Check if this specific product is loading
                  const isThisProductLoading = loadingProductId === product.id;

                  return (
                    <Card
                      key={product.id}
                      className="hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    >
                      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ objectFit: "contain" }}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
                          style={{ display: product.image ? "none" : "flex" }}
                        >
                          <div className="text-center p-4">
                            <div className="w-20 h-20 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <Grid3X3 className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                              {product.manufacturer}
                            </p>
                            <p className="text-xs text-gray-400">
                              {product.model}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "absolute top-3 left-3 h-9 w-9 p-0 rounded-full bg-white/95 hover:bg-white shadow-sm",
                            "transition-all duration-200 hover:scale-110",
                            isInWishlist(product.id) && "text-red-500 bg-red-50"
                          )}
                          onClick={() => handleWishlistToggle(product)}
                          disabled={
                            isAddingToWishlist || isRemovingFromWishlist
                          }
                        >
                          <Heart
                            className={cn(
                              "w-4 h-4 transition-all",
                              isInWishlist(product.id) &&
                                "fill-current scale-110"
                            )}
                          />
                        </Button>
                        {product?.manufacturer && (
                          <Badge className="absolute top-3 right-3 bg-white text-gray-900 shadow-sm">
                            {product.manufacturer}
                          </Badge>
                        )}
                        {product?.badges?.length > 0 && (
                          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                            <Badge className="bg-blue-500 text-white shadow-sm text-xs">
                              {product?.badges}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                          {product.name}
                        </CardTitle>

                        {product.sku && (
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              SKU: {product.sku}
                            </Badge>
                            {product.model && (
                              <Badge variant="outline" className="text-xs">
                                {product.model}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-end">
                          <div></div>
                          <div className="flex gap-2">
                            <Link to={`/store/product/${product.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              disabled={
                                product.status === 0 || isThisProductLoading
                              }
                              className="flex items-center gap-1"
                            >
                              {isThisProductLoading ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  Add to Cart
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {pagination && pagination.pages > 1 && (
                <Card className="mt-8">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-sm text-gray-600">
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
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
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
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className="min-w-[40px]"
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
                          className="flex items-center gap-1"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Grid3X3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No products found</p>
              {(selectedCategoryId || selectedSubCategoryId || searchQuery) && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
