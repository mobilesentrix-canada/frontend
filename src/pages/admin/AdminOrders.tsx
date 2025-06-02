import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useOrders } from "@/hooks/useOrders";
import { OrdersTableSkeleton } from "@/components/OrdersTableSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loading, LoadingSpinner } from "@/components/ui/loading";
import { Check, X, Search, Filter, RefreshCw, AlertCircle } from "lucide-react";

const StatusBadge = React.memo(({ status }: { status: string }) => {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 text-xs"
        >
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 text-xs"
        >
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 text-xs"
        >
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-xs">
          {status}
        </Badge>
      );
  }
});

const SearchAndFilter = React.memo(
  ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
  }: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
  }) => (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Filter className="w-4 h-4 md:w-5 md:h-5" />
          Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by order number, store..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
);

const MobileOrderCard = React.memo(
  ({
    order,
    onApprove,
    onReject,
    isApprovingOrder,
    isRejectingOrder,
    formatDate,
    formatCurrency,
  }: any) => (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-sm">#{order.order_number}</p>
              <p className="text-xs text-gray-500">
                {formatDate(order.created_at)}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">
                {order.user_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{order.user_name}</span>
            </div>
            <p className="text-xs text-gray-600">{order.store_name}</p>
            <p className="text-xs text-gray-600">{order.items_count} items</p>
            <p className="text-sm font-semibold">
              {formatCurrency(order.total_amount)}
            </p>
            {order.product_names && order.product_names.length > 0 && (
              <div className="text-xs text-gray-500">
                <p>{order.product_names[0]}</p>
                {order.product_names.length > 1 && (
                  <p>+{order.product_names.length - 1} more</p>
                )}
              </div>
            )}
          </div>

          {/* Modified action buttons logic */}
          {order.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => onApprove(order.id)}
                className="bg-green-600 hover:bg-green-700 text-white flex-1 text-xs"
                disabled={isApprovingOrder || isRejectingOrder}
              >
                <Check className="w-3 h-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(order.id)}
                className="flex-1 text-xs"
                disabled={isApprovingOrder || isRejectingOrder}
              >
                <X className="w-3 h-3 mr-1" />
                Reject
              </Button>
            </div>
          )}

          {order.status === "approved" && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(order.id)}
                className="flex-1 text-xs"
                disabled={isApprovingOrder || isRejectingOrder}
              >
                <X className="w-3 h-3 mr-1" />
                Reject Order
              </Button>
            </div>
          )}

          {order.status === "rejected" && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => onApprove(order.id)}
                className="bg-green-600 hover:bg-green-700 text-white flex-1 text-xs"
                disabled={isApprovingOrder || isRejectingOrder}
              >
                <Check className="w-3 h-3 mr-1" />
                Accept Order
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
);

const DesktopOrderRow = React.memo(
  ({
    order,
    onApprove,
    onReject,
    isApprovingOrder,
    isRejectingOrder,
    formatDate,
    formatCurrency,
  }: any) => (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium text-sm">
        #{order.order_number}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">
            {order.user_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-sm">{order.user_name}</span>
            <div className="text-xs text-gray-500">{order.user_email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm">{order.store_name}</TableCell>
      <TableCell>
        <div className="text-sm">
          <span className="font-medium">{order.items_count} items</span>
          {order.product_names && order.product_names.length > 0 && (
            <div className="text-xs text-gray-500">
              <div>{order.product_names[0]}</div>
              {order.product_names.length > 1 && (
                <div>+{order.product_names.length - 1} more</div>
              )}
            </div>
          )}
        </div>
      </TableCell>

      <TableCell>
        <StatusBadge status={order.status} />
      </TableCell>
      <TableCell className="text-xs text-gray-500">
        {formatDate(order.created_at)}
      </TableCell>
      <TableCell>
        {/* Modified action buttons logic */}
        {order.status === "pending" ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={() => onApprove(order.id)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
              disabled={isApprovingOrder || isRejectingOrder}
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(order.id)}
              className="text-xs px-2 py-1"
              disabled={isApprovingOrder || isRejectingOrder}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : order.status === "approved" ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(order.id)}
              className="text-xs px-2 py-1"
              disabled={isApprovingOrder || isRejectingOrder}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : order.status === "rejected" ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={() => onApprove(order.id)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
              disabled={isApprovingOrder || isRejectingOrder}
            >
              <Check className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <span className="text-gray-500 text-xs">No actions</span>
        )}
      </TableCell>
    </TableRow>
  )
);

function AdminOrdersContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const apiParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    }),
    [currentPage, statusFilter, debouncedSearchTerm]
  );

  const {
    orders,
    filteredOrders,
    pagination,
    isLoading,
    error,
    approveOrder,
    rejectOrder,
    refreshOrders,
    isApprovingOrder,
    isRejectingOrder,
  } = useOrders(apiParams);

  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  }, []);

  const formatCurrency = useCallback((amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? "$0.00" : `$${numAmount.toFixed(2)}`;
  }, []);

  const handleApprove = useCallback(
    async (orderId: number) => {
      try {
        await approveOrder(orderId);
      } catch (error) {
        console.error("Error approving order:", error);
      }
    },
    [approveOrder]
  );

  const handleReject = useCallback(
    async (orderId: number) => {
      try {
        await rejectOrder(orderId);
      } catch (error) {
        console.error("Error rejecting order:", error);
      }
    },
    [rejectOrder]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  const displayData = useMemo(() => {
    const baseOrders = pagination ? orders : filteredOrders;

    let filteredData = baseOrders;
    if (!pagination && debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filteredData = baseOrders.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchLower) ||
          order.user_name.toLowerCase().includes(searchLower) ||
          order.store_name.toLowerCase().includes(searchLower) ||
          order.user_email.toLowerCase().includes(searchLower)
      );
    }

    const totalPages = pagination
      ? pagination.pages
      : Math.ceil(filteredData.length / itemsPerPage);
    const totalItems = pagination ? pagination.total : filteredData.length;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const paginatedOrders = pagination
      ? filteredData
      : filteredData.slice(startIndex, endIndex);

    return {
      orders: paginatedOrders,
      totalPages,
      totalItems,
      startIndex,
      endIndex,
    };
  }, [orders, filteredOrders, pagination, debouncedSearchTerm, currentPage]);

  const isSearching = searchTerm !== debouncedSearchTerm;

  if (isLoading && orders.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Order Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Review and manage customer orders
          </p>
        </div>
        <OrdersTableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Order Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Review and manage customer orders
          </p>
        </div>
        <Button
          onClick={refreshOrders}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {isSearching && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <LoadingSpinner size="sm" />
          Searching...
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base md:text-lg">
                Orders ({displayData.totalItems})
              </CardTitle>
              <CardDescription className="text-sm">
                {displayData.totalItems === 0 &&
                (debouncedSearchTerm || statusFilter !== "all")
                  ? "No orders match your search criteria"
                  : `Showing ${displayData.startIndex + 1}-${
                      displayData.endIndex
                    } of ${displayData.totalItems} orders`}
              </CardDescription>
            </div>
            {(isLoading || isApprovingOrder || isRejectingOrder) &&
              orders.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoadingSpinner size="sm" />
                  {isApprovingOrder
                    ? "Approving..."
                    : isRejectingOrder
                    ? "Rejecting..."
                    : "Updating..."}
                </div>
              )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="block md:hidden">
            {displayData.orders.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-gray-500 text-sm">
                  {debouncedSearchTerm || statusFilter !== "all"
                    ? "No orders match your search criteria"
                    : "No orders found"}
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {displayData.orders.map((order) => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isApprovingOrder={isApprovingOrder}
                    isRejectingOrder={isRejectingOrder}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-20">Order #</TableHead>
                  <TableHead className="text-xs w-32">Member</TableHead>
                  <TableHead className="text-xs w-28">Store</TableHead>
                  <TableHead className="text-xs w-40">Items</TableHead>
                  <TableHead className="text-xs w-24">Status</TableHead>
                  <TableHead className="text-xs w-28">Date</TableHead>
                  <TableHead className="text-xs w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.orders.map((order) => (
                  <DesktopOrderRow
                    key={order.id}
                    order={order}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isApprovingOrder={isApprovingOrder}
                    isRejectingOrder={isRejectingOrder}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </TableBody>
            </Table>

            {displayData.orders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  {debouncedSearchTerm || statusFilter !== "all"
                    ? "No orders match your search criteria"
                    : "No orders found"}
                </p>
              </div>
            )}
          </div>
        </CardContent>

        {displayData.totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: Math.min(5, displayData.totalPages) },
                  (_, i) => {
                    const pageNumber = Math.max(
                      1,
                      Math.min(
                        currentPage - 2 + i,
                        displayData.totalPages - 4 + i
                      )
                    );
                    if (
                      pageNumber <= displayData.totalPages &&
                      pageNumber >= 1
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  }
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage >= displayData.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AdminOrders() {
  return (
    <ErrorBoundary>
      <AdminOrdersContent />
    </ErrorBoundary>
  );
}
