import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStores, Store, StoreFormData } from "@/hooks/useStores";
import { Loading, LoadingSpinner } from "@/components/ui/loading";
import {
  Search,
  Edit,
  Store as StoreIcon,
  Users,
  MapPin,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  AlertTriangle,
  Phone,
  Mail,
  UserCheck,
  Building,
  Crown,
  CheckCircle,
  XCircle,
  Settings,
  Plus,
  Grid3X3,
  List,
  SlidersHorizontal,
  Calendar,
  Eye,
  MoreVertical,
} from "lucide-react";

export default function AdminStores() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [storeTypeFilter, setStoreTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const {
    stores,
    pagination,
    isLoading,
    error,
    refetch,
    addStore,
    updateStore,
    deleteStore,
    isAddingStore,
    isUpdatingStore,
    isDeletingStore,
  } = useStores({
    page: currentPage,
    limit: pageLimit,
    searchTerm: debouncedSearchTerm,
    store_type: storeTypeFilter === "all" ? "" : storeTypeFilter,
    status: statusFilter === "all" ? "" : statusFilter,
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    store_type: "owned" as const,
    location: "",
    manager_name: "",
    phone_number: "",
    email_address: "",
    status: "active" as const,
    is_active: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStore) {
        const { store_id, ...updateData } = formData;
        await updateStore(editingStore.id, updateData);
      } else {
        const { store_id, ...createData } = formData;
        await addStore(createData);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving store:", error);
    }
  };

  const handleDeleteClick = (store: Store) => {
    setStoreToDelete(store);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!storeToDelete) return;

    try {
      await deleteStore(storeToDelete.id);
      setDeleteConfirmOpen(false);
      setStoreToDelete(null);
    } catch (error) {
      console.error("Error deleting store:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      store_type: "owned" as const,
      location: "",
      manager_name: "",
      phone_number: "",
      email_address: "",
      status: "active" as const,
      is_active: true,
    });
    setEditingStore(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      store_type: (store.store_type || "owned") as "owned" | "franchise",
      location: store.location || "",
      manager_name: store.manager_name || "",
      phone_number: store.phone_number || "",
      email_address: store.email_address || "",
      status: (store.status || "active") as
        | "active"
        | "inactive"
        | "maintenance",
      is_active: store.is_active ?? true,
    });
    setIsAddDialogOpen(true);
  };

  const getStoreTypeConfig = (type: string) => {
    return type === "franchise"
      ? {
          icon: Crown,
          label: "Franchise",
          color: "text-purple-600 bg-purple-100",
        }
      : { icon: Building, label: "Owned", color: "text-blue-600 bg-blue-100" };
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          icon: CheckCircle,
          label: "Active",
          color: "text-green-600 bg-green-100",
        };
      case "inactive":
        return {
          icon: XCircle,
          label: "Inactive",
          color: "text-red-600 bg-red-100",
        };
      case "maintenance":
        return {
          icon: Settings,
          label: "Maintenance",
          color: "text-amber-600 bg-amber-100",
        };
      default:
        return {
          icon: AlertCircle,
          label: "Unknown",
          color: "text-gray-600 bg-gray-100",
        };
    }
  };

  // Only show full screen loading on initial page load, not during search/filter
  if (
    isLoading &&
    stores.length === 0 &&
    currentPage === 1 &&
    !debouncedSearchTerm &&
    storeTypeFilter === "all" &&
    statusFilter === "all"
  ) {
    return <Loading text="Loading stores..." className="p-8" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
                <p className="text-gray-600 mt-1">
                  Manage your store locations and details
                </p>
                {pagination && (
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm text-gray-500">
                      {pagination.total} stores total
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {stores.filter((s) => s.status === "active").length}{" "}
                      active
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>

                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={resetForm}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Store
                    </Button>
                  </DialogTrigger>

                  {/* Form Dialog - Simplified and cleaner */}
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">
                        {editingStore ? "Edit Store" : "Create New Store"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingStore
                          ? "Update store information"
                          : "Add a new store to your network"}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Store Name *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                            placeholder="e.g., Downtown Mall Store"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium">
                            Store Type *
                          </Label>
                          <Select
                            value={formData.store_type}
                            onValueChange={(value: "owned" | "franchise") =>
                              setFormData({ ...formData, store_type: value })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owned">
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4" />
                                  Company Owned
                                </div>
                              </SelectItem>
                              <SelectItem value="franchise">
                                <div className="flex items-center gap-2">
                                  <Crown className="w-4 h-4" />
                                  Franchise
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">
                            Status *
                          </Label>
                          <Select
                            value={formData.status}
                            onValueChange={(
                              value: "active" | "inactive" | "maintenance"
                            ) => setFormData({ ...formData, status: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Active
                                </div>
                              </SelectItem>
                              <SelectItem value="inactive">
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  Inactive
                                </div>
                              </SelectItem>
                              <SelectItem value="maintenance">
                                <div className="flex items-center gap-2">
                                  <Settings className="w-4 h-4 text-amber-600" />
                                  Maintenance
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-2">
                          <Label
                            htmlFor="location"
                            className="text-sm font-medium"
                          >
                            Location *
                          </Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                location: e.target.value,
                              })
                            }
                            required
                            placeholder="e.g., 123 Main Street, Downtown"
                            className="mt-1"
                          />
                        </div>

                        <div className="col-span-2">
                          <Label
                            htmlFor="manager_name"
                            className="text-sm font-medium"
                          >
                            Manager Name
                          </Label>
                          <Input
                            id="manager_name"
                            value={formData.manager_name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                manager_name: e.target.value,
                              })
                            }
                            placeholder="e.g., John Smith"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="phone_number"
                            className="text-sm font-medium"
                          >
                            Phone Number
                          </Label>
                          <Input
                            id="phone_number"
                            value={formData.phone_number}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone_number: e.target.value,
                              })
                            }
                            placeholder="+1 (555) 123-4567"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="email_address"
                            className="text-sm font-medium"
                          >
                            Email Address
                          </Label>
                          <Input
                            id="email_address"
                            type="email"
                            value={formData.email_address}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email_address: e.target.value,
                              })
                            }
                            placeholder="store@company.com"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {!editingStore && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                Auto-generated Store ID
                              </p>
                              <p className="text-sm text-blue-700 mt-1">
                                A unique store ID (e.g., ST0001) will be
                                automatically generated when you create this
                                store.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isAddingStore || isUpdatingStore}
                          className="flex-1"
                        >
                          {(isAddingStore || isUpdatingStore) && (
                            <LoadingSpinner size="sm" className="mr-2" />
                          )}
                          {editingStore ? "Update Store" : "Create Store"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Filters and View Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                  <Select
                    value={storeTypeFilter}
                    onValueChange={setStoreTypeFilter}
                  >
                    <SelectTrigger className="w-32 border-gray-200">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="owned">Owned</SelectItem>
                      <SelectItem value="franchise">Franchise</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 border-gray-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-l border-gray-200 pl-3 flex items-center gap-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : String(error)}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Small loading indicator for search/filter operations */}
          {isLoading && (
            <div className="flex items-center justify-center py-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg px-4 py-2 shadow-sm border">
                <LoadingSpinner size="sm" />
                <span>Updating results...</span>
              </div>
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 ${
                isLoading ? "opacity-70 pointer-events-none" : ""
              }`}
            >
              {stores.map((store) => {
                const typeConfig = getStoreTypeConfig(
                  store.store_type || "owned"
                );
                const statusConfig = getStatusConfig(store.status || "active");
                const TypeIcon = typeConfig.icon;
                const StatusIcon = statusConfig.icon;

                return (
                  <Card
                    key={store.id}
                    className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.color}`}
                          >
                            <StoreIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                              {store.name}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-500">
                              {store.store_id}
                            </CardDescription>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(store)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(store)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">
                          {store.location || "No location"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          {typeConfig.label}
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </div>
                      </div>

                      {store.manager_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <UserCheck className="w-4 h-4" />
                          <span className="truncate">{store.manager_name}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {store.member_count || 0} members
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(store.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {stores.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StoreIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {debouncedSearchTerm ||
                storeTypeFilter !== "all" ||
                statusFilter !== "all"
                  ? "No stores match your criteria"
                  : "No stores yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {debouncedSearchTerm ||
                storeTypeFilter !== "all" ||
                statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first store"}
              </p>
              {!debouncedSearchTerm &&
                storeTypeFilter === "all" &&
                statusFilter === "all" && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Store
                  </Button>
                )}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} stores
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.pages) },
                    (_, i) => {
                      const pageNum = pagination.page - 2 + i;
                      if (pageNum < 1 || pageNum > pagination.pages)
                        return null;

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === pagination.page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={isLoading}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages || isLoading}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle>Delete Store</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  store and remove all associated data.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="py-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {storeToDelete?.name}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Store ID:</span>{" "}
                  {storeToDelete?.store_id}
                </div>
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  {storeToDelete?.store_type || "owned"}
                </div>
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {storeToDelete?.location || "Not set"}
                </div>
                <div>
                  <span className="font-medium">Members:</span>{" "}
                  {storeToDelete?.member_count || 0}
                </div>
              </div>
            </div>

            {storeToDelete?.member_count &&
              Number(storeToDelete.member_count) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span className="font-medium text-amber-800">Warning</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">
                    This store has {storeToDelete.member_count} member(s).
                    Deleting it will remove all memberships.
                  </p>
                </div>
              )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingStore}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeletingStore}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingStore ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Store"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
