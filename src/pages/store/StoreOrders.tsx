import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrdersList } from "@/hooks/useUserOrder";
import { useUserOrder } from "@/hooks/useUserOrder";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingBag,
  X,
  Trash2,
  RotateCcw,
} from "lucide-react";

export default function StoreOrders() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const limit = 10;

  const { orders, pagination, isLoading, error, refetch } = useOrdersList({
    page: currentPage,
    limit,
    status: statusFilter || undefined,
  });

  const {
    cancelOrder,
    deleteOrder,
    restoreOrderToCart,
    isCancellingOrder,
    isDeletingOrder,
    isRestoringOrderToCart,
    cancelOrderError,
    deleteOrderError,
    restoreOrderToCartError,
  } = useUserOrder();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder(orderId);
        refetch();
      } catch (error) {
        console.error("Failed to cancel order:", error);
      }
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      try {
        await deleteOrder(orderId);
        refetch();
      } catch (error) {
        console.error("Failed to delete order:", error);
      }
    }
  };

  const canCancelOrder = (status: string) => status === "pending";
  const canDeleteOrder = (status: string) =>
    ["pending", "cancelled"].includes(status);
  const canRestoreToCart = (status: string) =>
    ["pending", "cancelled"].includes(status);

  const getProductImage = (productName: string, index: number) => {
    const placeholderColors = [
      "bg-blue-100",
      "bg-green-100",
      "bg-purple-100",
      "bg-pink-100",
      "bg-yellow-100",
      "bg-indigo-100",
    ];
    return placeholderColors[index % placeholderColors.length];
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const placeholder = img.nextElementSibling as HTMLElement;
    img.style.display = "none";
    if (placeholder) {
      placeholder.style.display = "flex";
    }
  };

  const isValidImageUrl = (url: string | null) => {
    return (
      url &&
      url.trim() !== "" &&
      (url.startsWith("http") || url.startsWith("/"))
    );
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            Track your order history and status
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading your orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            Track your order history and status
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load orders
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">
              Track your order history and status
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Filter by Status
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              statusFilter === ""
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            }`}
          >
            All Orders
          </button>
          {["pending", "approved", "rejected", "completed", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                  statusFilter === status
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {(cancelOrderError || deleteOrderError || restoreOrderToCartError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-medium text-red-800">Order Action Error</h3>
          </div>
          {cancelOrderError && (
            <p className="text-red-700 text-sm">
              Cancel Error: {cancelOrderError.message}
            </p>
          )}

          {restoreOrderToCartError && (
            <p className="text-red-700 text-sm">
              Restore Error: {restoreOrderToCartError.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-gray-500" />
                    <CardTitle className="text-xl">
                      Order #{order.order_number}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Placed on {formatDate(order.created_at)}
                  </CardDescription>
                  <CardDescription className="mt-1 text-sm font-medium text-blue-600">
                    📍 {order.store_name}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge
                    className={`${getStatusColor(
                      order.status
                    )} border font-medium px-3 py-1`}
                  >
                    {order.status.toUpperCase()}
                  </Badge>

                  <p className="text-sm text-gray-500 mt-1">
                    {order.items_count} item{order.items_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </CardHeader>

            {(canCancelOrder(order.status) ||
              canRestoreToCart(order.status)) && (
              <div className="px-6 pb-4">
                <div className="flex gap-2 flex-wrap">
                  {canCancelOrder(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={isCancellingOrder}
                      className="flex items-center px-3 py-1.5 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {isCancellingOrder ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                </div>
              </div>
            )}

            <CardContent>
              <div>
                <h4 className="font-semibold mb-4 text-gray-800">
                  Order Items:
                </h4>
                <div className="grid gap-3">
                  {order.product_details && order.product_details.length > 0
                    ? order.product_details.map((product, index) => (
                        <div
                          key={`${product.product_id}-${index}`}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 relative">
                            {isValidImageUrl(product.image_url) ? (
                              <>
                                <img
                                  src={product.image_url!}
                                  alt={
                                    product.display_name || product.product_name
                                  }
                                  className="w-full h-full object-cover"
                                  onError={handleImageError}
                                />
                                <div
                                  className={`absolute inset-0 ${getProductImage(
                                    product.product_name,
                                    index
                                  )} flex items-center justify-center hidden`}
                                >
                                  <Package className="h-8 w-8 text-gray-600" />
                                </div>
                              </>
                            ) : (
                              <div
                                className={`w-full h-full ${getProductImage(
                                  product.product_name,
                                  index
                                )} flex items-center justify-center`}
                              >
                                <Package className="h-8 w-8 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 leading-tight">
                              {product.display_name || product.product_name}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>Qty: {product.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    : order.product_names.map((productName, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div
                            className={`w-16 h-16 rounded-lg ${getProductImage(
                              productName,
                              index
                            )} flex items-center justify-center flex-shrink-0`}
                          >
                            <Package className="h-8 w-8 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 leading-tight">
                              {productName}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Product #{index + 1}
                            </p>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span> orders
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              <div className="flex space-x-1">
                {Array.from(
                  { length: Math.min(pagination.pages, 7) },
                  (_, i) => {
                    let page;
                    if (pagination.pages <= 7) {
                      page = i + 1;
                    } else if (currentPage <= 4) {
                      page = i + 1;
                    } else if (currentPage >= pagination.pages - 3) {
                      page = pagination.pages - 6 + i;
                    } else {
                      page = currentPage - 3 + i;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          page === currentPage
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No orders found
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {statusFilter
              ? `No orders with status "${statusFilter}". Try selecting a different filter or check back later.`
              : "Your order history will appear here once you place your first order. Start shopping to see your orders!"}
          </p>
        </div>
      )}
    </div>
  );
}
