import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useProduct } from "@/hooks/useProducts";
import { useCart, useWishlist } from "@/hooks/useCart";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Plus,
  Minus,
  Package,
  Truck,
  Shield,
  Star,
  Grid3X3,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { toast } = useToast();

  const { product, isLoading, error } = useProduct(id ? parseInt(id) : 0);
  const { addToCart, cartItems, updateCartItem, removeCartItem } = useCart();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isAddingToWishlist,
    isRemovingFromWishlist,
  } = useWishlist();

  // Helper functions to work with cart
  const getCartItemForProduct = (productId: number) => {
    return cartItems.find((item) => item.product.id === productId);
  };

  const getProductQuantityInCart = (productId: number) => {
    const cartItem = getCartItemForProduct(productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Set initial quantity based on cart when product loads
  useEffect(() => {
    if (product) {
      const cartQuantity = getProductQuantityInCart(product.id);
      if (cartQuantity > 0) {
        setQuantity(cartQuantity);
      }
    }
  }, [product, cartItems]);

  const isProductInCart = product
    ? getProductQuantityInCart(product.id) > 0
    : false;

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      if (isProductInCart) {
        // Update existing cart item
        const cartItem = getCartItemForProduct(product.id);
        if (cartItem) {
          await updateCartItem(cartItem.id, { quantity: quantity });
          toast({
            title: "Cart updated",
            description: `${product.name} quantity updated to ${quantity}`,
          });
        }
      } else {
        // Add new item to cart
        await addToCart({
          product_id: product.id,
          quantity: quantity,
        });
        toast({
          title: "Added to cart",
          description: `${quantity} x ${product.name} added to your cart`,
        });
      }

      navigate("/store/cart");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    const productId = product.id;

    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist`,
        });
      } else {
        await addToWishlist({ product_id: productId });
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleQuantityInput = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      setQuantity(num);
    }
  };

  const parseDescription = (description: string) => {
    if (!description) return null;

    if (description.includes("<ul") && description.includes("<li")) {
      try {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = description;

        const listItems = tempDiv.querySelectorAll("li");
        const items = Array.from(listItems).map(
          (li) => li.textContent?.trim() || ""
        );

        return items.filter((item) => item.length > 0);
      } catch (error) {
        console.error("Error parsing description:", error);
        return null;
      }
    }

    return null;
  };

  const renderDescription = (description: string) => {
    const listItems = parseDescription(description);

    if (listItems && listItems.length > 0) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Key Features
            </span>
          </div>
          <ul className="space-y-2">
            {listItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <p className="text-gray-700 leading-relaxed">
        {description ||
          `${product?.manufacturer} ${product?.model} - High-quality product with excellent specifications.`}
      </p>
    );
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <Skeleton className="w-full h-full" />
          </div>

          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-8 w-24" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
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
          <p className="text-red-500 text-lg mb-2">Error loading product</p>
          <p className="text-gray-500 mb-4">{error.message}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            <Button variant="outline" onClick={() => navigate("/store")}>
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
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
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg mb-4">Product not found</p>
          <Button onClick={() => navigate("/store")}>Back to Products</Button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.status === 0;
  const isInWishlistCheck = isInWishlist(product.id);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
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
            <div className="text-center p-8">
              <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Grid3X3 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {product.manufacturer}
              </h3>
              <p className="text-gray-500">{product.model}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute top-4 right-4 h-12 w-12 p-0 rounded-full bg-white/95 hover:bg-white shadow-lg",
              "transition-all duration-200 hover:scale-110",
              isInWishlistCheck && "text-red-500 bg-red-50"
            )}
            onClick={handleWishlistToggle}
            disabled={isAddingToWishlist || isRemovingFromWishlist}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-all",
                isInWishlistCheck && "fill-current scale-110"
              )}
            />
          </Button>

          {isOutOfStock && (
            <Badge className="absolute top-4 left-4 bg-red-500 text-white">
              Out of Stock
            </Badge>
          )}
          {product.badges && (
            <Badge className="absolute bottom-4 left-4 bg-blue-500 text-white">
              {product.badges}
            </Badge>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{product.manufacturer}</Badge>
              {product.sku && (
                <Badge variant="outline" className="text-xs">
                  SKU: {product.sku}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-4">
              {product.model && (
                <Badge variant="outline" className="text-sm">
                  Model: {product.model}
                </Badge>
              )}
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add to Cart</CardTitle>
              <CardDescription>
                {isOutOfStock ? (
                  <span className="text-red-600 font-medium">
                    Currently out of stock
                  </span>
                ) : (
                  "Select quantity and add to your cart"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isOutOfStock && (
                <div className="space-y-3">
                  <Label htmlFor="quantity" className="text-sm font-medium">
                    Quantity{" "}
                    {isProductInCart && (
                      <span className="text-green-600 font-normal">
                        (Currently {getProductQuantityInCart(product.id)} in
                        cart)
                      </span>
                    )}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="h-10 w-10 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) => handleQuantityInput(e.target.value)}
                      className="w-20 text-center"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      className="h-10 w-10 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isProductInCart
                        ? "Updating Cart..."
                        : "Adding to Cart..."}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {isProductInCart ? "Update Cart" : "Add to Cart"}
                    </>
                  )}
                </Button>

                {product.price > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/store/cart")}
                    className="w-full"
                  >
                    View Cart
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card style={{ marginTop: "1rem" }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Product Description
          </CardTitle>
        </CardHeader>
        <CardContent>{renderDescription(product.description)}</CardContent>
      </Card>
    </div>
  );
}
