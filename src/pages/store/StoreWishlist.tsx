import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCart, useWishlist } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  X,
  Heart,
  ShoppingCart,
  AlertCircle,
  Package,
  Grid3X3,
  Plus,
  Trash2,
} from "lucide-react";

export default function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [movingToCart, setMovingToCart] = useState<{ [key: string]: boolean }>(
    {}
  );

  const {
    wishlistItems,
    isLoading: isWishlistLoading,
    error: wishlistError,
    removeFromWishlist,
    isRemovingFromWishlist,
    isInWishlist,
  } = useWishlist();

  const { addToCart, isAddingToCart, addToCartError } = useCart();

  const handleRemoveFromWishlist = (productId: string | number) => {
    removeFromWishlist(productId, {
      onSuccess: () => {
        toast({
          title: "Item removed",
          description: "Product has been removed from your wishlist",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to remove item from wishlist",
          variant: "destructive",
        });
      },
    });
  };

  const handleMoveToCart = async (productId: string | number) => {
    if (!user) return;

    const productKey = productId.toString();
    setMovingToCart((prev) => ({ ...prev, [productKey]: true }));

    try {
      await new Promise((resolve) => {
        addToCart(
          { product_id: productId, quantity: 1 },
          {
            onSuccess: () => {
              removeFromWishlist(productId, {
                onSuccess: () => {
                  toast({
                    title: "Moved to cart!",
                    description:
                      "Product has been added to your cart and removed from wishlist",
                  });
                  resolve(true);
                },
                onError: () => {
                  toast({
                    title: "Added to cart",
                    description:
                      "Product added to cart, but couldn't remove from wishlist",
                  });
                  resolve(true);
                },
              });
            },
            onError: (error) => {
              toast({
                title: "Error",
                description: error.message || "Failed to add product to cart",
                variant: "destructive",
              });
              resolve(null);
            },
          }
        );
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setMovingToCart((prev) => ({ ...prev, [productKey]: false }));
    }
  };

  const handleProductClick = (productId: string | number) => {
    navigate(`/store/products/${productId}`);
  };


  if (isWishlistLoading) {
    return (
      <div className="px-4 py-6">
        <Skeleton className="h-10 w-40 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-64 mb-6" />
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-10" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }


  if (wishlistError) {
    return (
      <div className="px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/store")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error loading wishlist
          </h2>
          <p className="text-gray-500 mb-6">{wishlistError.message}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            <Button variant="outline" onClick={() => navigate("/store")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }


  if (wishlistItems.length === 0) {
    return (
      <div className="px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/store")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Save your favorite products for later
          </p>
          <Button onClick={() => navigate("/store")} size="lg" className="px-8">
            <Package className="w-5 h-5 mr-2" />
            Browse Products
          </Button>
        </div>
      </div>
    );
  }
  console.log(wishlistItems);
  return (
    <div className="px-4 py-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/store")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Continue Shopping
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <Badge variant="secondary" className="text-sm">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"}
            </Badge>
          </div>

          {wishlistItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleProductClick(item.product_id)}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={item?.product?.image_url}
                        alt={item?.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div
                    className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleProductClick(item.product_id)}
                  >
                    <h3 className="font-semibold text-gray-900 truncate">
                      Product ID: {item.product_id}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleMoveToCart(item.product_id)}
                      disabled={
                        movingToCart[item.product_id.toString()] ||
                        isAddingToCart
                      }
                      className="h-9"
                    >
                      {movingToCart[item.product_id.toString()] ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Moving...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromWishlist(item.product_id)}
                      disabled={isRemovingFromWishlist}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isRemovingFromWishlist ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Wishlist Summary
              </CardTitle>
              <CardDescription>
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "item" : "items"} saved for later
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">
                  Recent Items
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {wishlistItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate pr-2">
                        Product ID: {item.product_id}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => navigate("/store")}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Continue Shopping
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/store/cart")}
                  className="w-full"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Cart
                </Button>
              </div>

              <div className="pt-4 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Items saved in your wishlist</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Click on items to view product details</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
