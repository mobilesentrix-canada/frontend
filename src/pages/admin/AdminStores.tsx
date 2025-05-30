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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStores, Store } from "@/hooks/useStores";
import { Loading, LoadingSpinner } from "@/components/ui/loading";
import {
  Search,
  Edit,
  X,
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
} from "lucide-react";

export default function AdminStores() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

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
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    store_id: "",
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
        await updateStore(editingStore.id, formData);
      } else {
        await addStore(formData);
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

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setStoreToDelete(null);
  };

  const resetForm = () => {
    setFormData({ name: "", location: "", store_id: "", is_active: true });
    setEditingStore(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      location: store.location || "",
      store_id: store.store_id,
      is_active: store.is_active ?? true,
    });
    setIsAddDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setPageLimit(limit);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    if (!pagination) return [];

    const { page, pages } = pagination;
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (isLoading && stores.length === 0 && currentPage === 1) {
    return <Loading text="Loading stores..." className="p-8" />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store</h1>
          <p className="text-gray-600 mt-2">
            Total Number of Stores:
            {pagination && (
              <span className="ml-1 text-sm">{pagination.total}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
              >
                Add New Store
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingStore ? "Edit Store" : "Add New Store"}
                </DialogTitle>
                <DialogDescription>
                  {editingStore
                    ? "Update store information"
                    : "Enter store details below"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Store Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Enter store name"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                    placeholder="Enter store location"
                  />
                </div>
                <div>
                  <Label htmlFor="storeId">Store ID</Label>
                  <Input
                    id="storeId"
                    value={formData.store_id}
                    onChange={(e) =>
                      setFormData({ ...formData, store_id: e.target.value })
                    }
                    required
                    disabled={!!editingStore}
                    placeholder="Enter unique store ID"
                  />
                </div>
                <div>
                  <Label htmlFor="isActive">Status</Label>
                  <select
                    id="isActive"
                    value={formData.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.value === "true",
                      })
                    }
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-black focus:outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isAddingStore || isUpdatingStore}
                  >
                    {(isAddingStore || isUpdatingStore) && (
                      <LoadingSpinner size="sm" className="mr-2" />
                    )}
                    {editingStore ? "Update" : "Add"} Store
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : String(error)}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search stores by name, ID, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Show:</span>
          <select
            value={pageLimit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="rounded-md border border-gray-300 p-1 text-sm focus:border-black focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-600">per page</span>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center mb-4">
          <LoadingSpinner size="sm" className="mr-2" />
          <span className="text-sm text-gray-600">Loading stores...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <Card key={store.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg ${
                      store.is_active ? "bg-black" : "bg-gray-400"
                    } flex items-center justify-center text-white`}
                  >
                    <StoreIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {store.name}
                      {!store.is_active && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Inactive
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {store.location || "No location set"}
                    </CardDescription>
                    <CardDescription className="text-xs mt-1">
                      ID: {store.store_id}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(store)}
                    className="h-8 w-8 p-0"
                    disabled={isUpdatingStore}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(store)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={isDeletingStore}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Members
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {store.member_count ?? 0}
                  </span>
                </div>

                <div className="text-xs text-gray-400">
                  Created: {new Date(store.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                  Delete Store
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-1">
                  This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-700 mb-3">
              Are you sure you want to delete the store:{" "}
              <span className="font-semibold text-gray-900">
                {storeToDelete?.name}
              </span>
              ?
            </p>

            {storeToDelete?.member_count &&
              Number(storeToDelete?.member_count) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Warning
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    This store has {storeToDelete.member_count} member(s).
                    Deleting it will remove all associated memberships.
                  </p>
                </div>
              )}

            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <strong>Store ID:</strong> {storeToDelete?.store_id}
                </div>
                <div>
                  <strong>Location:</strong>{" "}
                  {storeToDelete?.location || "No location set"}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  {storeToDelete?.is_active ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isDeletingStore}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeletingStore}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeletingStore ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Store
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {getPageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                disabled={isLoading}
                className="min-w-[2.5rem]"
              >
                {pageNum}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {stores.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <StoreIcon className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-xl text-gray-500 mb-2">
            {debouncedSearchTerm
              ? "No stores match your search"
              : "No stores found"}
          </p>
          <p className="text-gray-400">
            {debouncedSearchTerm
              ? "Try adjusting your search criteria"
              : "Add your first store to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
