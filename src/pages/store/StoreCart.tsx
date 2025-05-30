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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCart, useOrders } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  CreditCard,
  Package,
  Grid3X3,
} from "lucide-react";

export default function StoreCart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const {
    store,
    cartItems,
    total,
    count,
    isLoading,
    error,
    updateCartItem,
    removeCartItem,
    clearCart,
    isUpdatingCart,
    isRemovingFromCart,
    isClearingCart,
  } = useCart();

  const { placeOrderFromCart, isPlacingOrderFromCart } = useOrders();

  const handleQuantityChange = (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId);
      return;
    }

    updateCartItem(cartItemId, { quantity: newQuantity });
  };

  const handleRemoveItem = (cartItemId: number) => {
    removeCartItem(cartItemId);
    toast({
      title: "Item removed",
      description: "Product has been removed from your cart",
    });
  };

  const handleClearCart = () => {
    if (confirm("Are you sure you want to clear your entire cart?")) {
      clearCart(undefined);
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0 || !user) return;
    const storeId = store.id ? parseInt(store.id) : 1;
    const product = cartItems.map((item) => {
      return {
        id: item.product.id,
        quantity: item.quantity,
        name: item.product.name,
        price: item.product.price,
      };
    });
    setIsCheckingOut(true);

    try {
      await new Promise((resolve) => {
        placeOrderFromCart(
          { store_id: storeId, products: product },
          {
            onSuccess: (data) => {
              toast({
                title: "Order placed successfully!",
                description: `Order #${data.data.order_number} has been submitted for approval`,
              });
              navigate("/store/orders");
              resolve(data);
            },
            onError: (error) => {
              toast({
                title: "Error placing order",
                description:
                  error.message || "Failed to place order. Please try again.",
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
      setIsCheckingOut(false);
    }
  };


  if (isLoading) {
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
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-10 w-10" />
                    </div>
                    <Skeleton className="h-6 w-16" />
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
                <Skeleton className="h-px w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }


  if (error) {
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
            Error loading cart
          </h2>
          <p className="text-gray-500 mb-6">{error.message}</p>
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


  if (cartItems.length === 0) {
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
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Add some products to get started
          </p>
          <Button onClick={() => navigate("/store")} size="lg" className="px-8">
            <Package className="w-5 h-5 mr-2" />
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <Badge variant="secondary" className="text-sm">
              {count} {count === 1 ? "item" : "items"}
            </Badge>
          </div>

          {cartItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
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
                      className="w-full h-full flex items-center justify-center"
                      style={{ display: item.product?.image ? "none" : "flex" }}
                    >
                      <Grid3X3 className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.product.manufacturer}
                      </Badge>
                      {item.product.sku && (
                        <Badge variant="outline" className="text-xs">
                          SKU: {item.product.sku}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={isUpdatingCart || item.quantity <= 1}
                      className="h-9 w-9 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <Input
                      type="number"
                      min="1"
                      max="99"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value > 0) {
                          handleQuantityChange(item.id, value);
                        }
                      }}
                      className="w-16 text-center"
                      disabled={isUpdatingCart}
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      disabled={isUpdatingCart || item.quantity >= 99}
                      className="h-9 w-9 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isRemovingFromCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isRemovingFromCart ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Order Summary
              </CardTitle>
              <CardDescription>
                {count} {count === 1 ? "item" : "items"} in your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate pr-2">
                      {item.product.name} × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200" />

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 text-base"
                  disabled={
                    isCheckingOut ||
                    isPlacingOrderFromCart ||
                    cartItems.length === 0
                  }
                  size="lg"
                >
                  {isCheckingOut || isPlacingOrderFromCart ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  disabled={isClearingCart || cartItems.length === 0}
                  className="w-full"
                >
                  {isClearingCart ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Cart
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-4 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Orders require approval before processing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
