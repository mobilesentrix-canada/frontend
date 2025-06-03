import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderDetail } from "@/hooks/useOrderDetails";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  Store,
  Package,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Check,
  X,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
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

  return (
    <Badge className={`${getStatusColor(status)} border font-medium px-3 py-1`}>
      {status.toUpperCase()}
    </Badge>
  );
};

// Product Image Component
const ProductImage = ({
  imageUrl,
  productName,
  index,
}: {
  imageUrl?: string;
  productName: string;
  index: number;
}) => {
  const [imageError, setImageError] = useState(false);

  const placeholderColors = [
    "bg-blue-100",
    "bg-green-100",
    "bg-purple-100",
    "bg-pink-100",
    "bg-yellow-100",
    "bg-indigo-100",
  ];

  const isValidImageUrl = (url?: string) => {
    return (
      url &&
      url.trim() !== "" &&
      (url.startsWith("http") || url.startsWith("/"))
    );
  };

  if (!isValidImageUrl(imageUrl) || imageError) {
    return (
      <div
        className={`w-16 h-16 rounded-lg ${
          placeholderColors[index % placeholderColors.length]
        } flex items-center justify-center flex-shrink-0`}
      >
        <Package className="h-8 w-8 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
      <img
        src={imageUrl}
        alt={productName}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

// Approve Order Dialog Component
const ApproveOrderDialog = ({
  onConfirm,
  isLoading,
  children,
}: {
  onConfirm: (notes?: string) => void;
  isLoading: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined);
    setOpen(false);
    setNotes("");
  };

  const handleCancel = () => {
    setOpen(false);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Approve Order
          </DialogTitle>
          <DialogDescription>
            You are about to approve this order. This action will notify the
            customer and update the order status to "Approved".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approve-notes">Notes (Optional)</Label>
            <Textarea
              id="approve-notes"
              placeholder="Add any notes about the approval..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Approve Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Reject Order Dialog Component
const RejectOrderDialog = ({
  onConfirm,
  isLoading,
  children,
}: {
  onConfirm: (notes?: string) => void;
  isLoading: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined);
    setOpen(false);
    setNotes("");
  };

  const handleCancel = () => {
    setOpen(false);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Reject Order
          </DialogTitle>
          <DialogDescription>
            You are about to reject this order. This action will notify the
            customer and update the order status to "Rejected".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reject-notes">
              Reason for Rejection (Optional)
            </Label>
            <Textarea
              id="reject-notes"
              placeholder="Please provide a reason for rejecting this order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Reject Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Simple Alert Dialog for status changes
const SimpleConfirmDialog = ({
  title,
  description,
  onConfirm,
  isLoading,
  variant = "default",
  children,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading: boolean;
  variant?: "default" | "destructive";
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Component - Admin Order Details
export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // Use the correct admin hook
  const { order, isLoading, error, refetch, updateStatus, isUpdatingStatus } =
    useOrderDetail(orderId!);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? "$0.00" : `$${numAmount.toFixed(2)}`;
  };

  const handleApproveOrder = async (notes?: string) => {
    if (!order) return;
    try {
      await updateStatus("approved", notes);
    } catch (error) {
      console.error("Failed to approve order:", error);
    }
  };

  const handleRejectOrder = async (notes?: string) => {
    if (!order) return;
    try {
      await updateStatus("rejected", notes);
    } catch (error) {
      console.error("Failed to reject order:", error);
    }
  };

  // Get product details - check both possible data structures
  const getProductDetails = () => {
    if (order?.product_details && order.product_details.length > 0) {
      return order.product_details;
    }
    if (order?.items && order.items.length > 0) {
      return order.items;
    }
    return null;
  };

  const productDetails = getProductDetails();

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load order details
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "Order not found"}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600 mt-1">Order details and management</p>
          </div>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status & Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order Status
                  </CardTitle>
                  <CardDescription>
                    Current status and available actions
                  </CardDescription>
                </div>
                <StatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Clock className="h-4 w-4" />
                Last updated: {formatDate(order.updated_at)}
              </div>

              {/* Admin Action Buttons with Dialogs */}
              {order.status === "pending" && (
                <div className="flex gap-2">
                  <ApproveOrderDialog
                    onConfirm={handleApproveOrder}
                    isLoading={isUpdatingStatus}
                  >
                    <Button
                      disabled={isUpdatingStatus}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Order
                    </Button>
                  </ApproveOrderDialog>

                  <RejectOrderDialog
                    onConfirm={handleRejectOrder}
                    isLoading={isUpdatingStatus}
                  >
                    <Button disabled={isUpdatingStatus} variant="destructive">
                      <X className="h-4 w-4 mr-2" />
                      Reject Order
                    </Button>
                  </RejectOrderDialog>
                </div>
              )}

              {order.status === "approved" && (
                <RejectOrderDialog
                  onConfirm={handleRejectOrder}
                  isLoading={isUpdatingStatus}
                >
                  <Button disabled={isUpdatingStatus} variant="destructive">
                    <X className="h-4 w-4 mr-2" />
                    Reject Order
                  </Button>
                </RejectOrderDialog>
              )}

              {order.status === "rejected" && (
                <ApproveOrderDialog
                  onConfirm={handleApproveOrder}
                  isLoading={isUpdatingStatus}
                >
                  <Button
                    disabled={isUpdatingStatus}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Order
                  </Button>
                </ApproveOrderDialog>
              )}

              {isUpdatingStatus && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating order status...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.items_count})
              </CardTitle>
              <CardDescription>Products included in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productDetails && productDetails.length > 0 ? (
                  productDetails.map((product, index) => (
                    <div
                      key={`${product.product_id}-${index}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ProductImage
                        imageUrl={product.image_url}
                        productName={product.product_name}
                        index={index}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {product.display_name || product.product_name}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>Quantity: {product.quantity}</span>
                          <span>Price: {formatCurrency(product.price)}</span>
                          {product.category && (
                            <span>Category: {product.category}</span>
                          )}
                          {product.brand && <span>Brand: {product.brand}</span>}
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(
                            parseFloat(product.price) * product.quantity
                          )}
                        </p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                    </div>
                  ))
                ) : order.product_names ? (
                  order.product_names.map((productName, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ProductImage productName={productName} index={index} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 leading-tight">
                          {productName}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Product #{index + 1}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No product details available
                  </div>
                )}
              </div>

              {/* Order Total */}
              <div className="border-t pt-4 mt-6">
                <div className="space-y-2">
                  {order.subtotal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                  )}
                  {order.tax_amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span>{formatCurrency(order.tax_amount)}</span>
                    </div>
                  )}
                  {order.shipping_fee && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span>{formatCurrency(order.shipping_fee)}</span>
                    </div>
                  )}
                  {order.discount_amount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Order Total:</span>
                      <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center">
                  {order.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.user_name}</p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{order.user_email}</span>
                </div>
                {order.user_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{order.user_phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{order.store_name}</span>
                </div>
                <p className="text-sm text-gray-500">
                  Store ID: {order.store_id}
                </p>
                {order.store_address && (
                  <p className="text-sm text-gray-500">{order.store_address}</p>
                )}
                {order.store_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{order.store_phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Order Placed</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(order.updated_at)}
                  </p>
                </div>
              </div>
              {order.estimated_delivery && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Estimated Delivery</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.estimated_delivery)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p>{order.shipping_address.street}</p>
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state}{" "}
                    {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
