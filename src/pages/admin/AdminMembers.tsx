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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMembers, Member } from "@/hooks/useMembers";
import { useStores } from "@/hooks/useStores";
import { Loading, LoadingSpinner } from "@/components/ui/loading";
import {
  Search,
  Edit,
  X,
  AlertCircle,
  RefreshCw,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  AlertTriangle,
  User,
} from "lucide-react";

export default function AdminMembers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const {
    members,
    pagination,
    isLoading,
    error,
    refetch,
    addMember,
    updateMember,
    deleteMember,
    assignStore,
    isAddingMember,
    isUpdatingMember,
    isDeletingMember,
    isAssigningStore,
  } = useMembers({
    page: currentPage,
    limit: pageLimit,
    role: "user",
    search: debouncedSearchTerm,
  });

  const { stores } = useStores({
    page: 1,
    limit: 100,
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assigningMember, setAssigningMember] = useState<Member | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    store_id: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const generatePassword = () => {
    return "temp" + Math.random().toString(36).substring(2, 8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await updateMember(editingMember.id, {
          name: formData.name,
          is_active: true,
        });
      } else {
        const memberData = {
          email: formData.email,
          password: formData.password || generatePassword(),
          name: formData.name,
          role: formData.role,
          store_id:
            formData.store_id && formData.store_id !== "none"
              ? parseInt(formData.store_id)
              : undefined,
        };
        await addMember(memberData);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      await deleteMember(memberToDelete.id);
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setMemberToDelete(null);
  };

  const handleAssignStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningMember || !formData.store_id) return;

    try {
      await assignStore({
        userId: assigningMember.id,
        storeId: parseInt(formData.store_id),
      });
      setIsAssignDialogOpen(false);
      setAssigningMember(null);
      setFormData({ ...formData, store_id: "" });
    } catch (error) {
      console.error("Error assigning store:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      store_id: "",
      password: "",
      role: "user",
    });
    setEditingMember(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      store_id: member.store_id ? member.store_id.toString() : "none",
      password: "",
      role: member.role,
    });
    setIsAddDialogOpen(true);
  };

  const openAssignDialog = (member: Member) => {
    setAssigningMember(member);
    setFormData({ ...formData, store_id: "" });
    setIsAssignDialogOpen(true);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading && members.length === 0 && currentPage === 1) {
    return <Loading text="Loading members..." className="p-8" />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-2">
            Manage your store team
            {pagination && (
              <span className="ml-2 text-sm">
                ({pagination.total} total members)
              </span>
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
                onClick={() => resetForm()}
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
              >
                Add New Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  {editingMember ? "Edit Member" : "Add New Member"}
                </DialogTitle>
                <DialogDescription>
                  {editingMember
                    ? "Update member information"
                    : "Enter member details below"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Enter member name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={!!editingMember}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                    defaultValue="user"
                    disabled
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!editingMember && (
                  <div>
                    <Label htmlFor="store">Store (Optional)</Label>
                    <Select
                      value={formData.store_id || "none"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          store_id: value === "none" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a store (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Store</SelectItem>
                        {stores.map((store) => (
                          <SelectItem
                            key={store.id}
                            value={store.id.toString()}
                          >
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {!editingMember && (
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="text"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      placeholder="Password Required"
                    />
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isAddingMember || isUpdatingMember}
                  >
                    {(isAddingMember || isUpdatingMember) && (
                      <LoadingSpinner size="sm" className="mr-2" />
                    )}
                    {editingMember ? "Update" : "Add"} Member
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
            placeholder="Search members by name or email..."
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
          <span className="text-sm text-gray-600">Loading members...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {member.name && member.name.length > 10
                        ? member.name.substring(0, 10) + ".."
                        : member.name}
                      {!member.is_active && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Inactive
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {member.email && member.email.length > 10
                        ? member.email.substring(0, 10) + "..."
                        : member.email}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAssignDialog(member)}
                    className="h-8 w-8 p-0"
                    disabled={isAssigningStore}
                    title="Assign to Store"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(member)}
                    className="h-8 w-8 p-0"
                    disabled={isUpdatingMember}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(member)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={isDeletingMember}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Store:
                    </span>
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      member.store_name
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {member.store_name || "Not Assigned"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Role:
                  </span>
                  <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full capitalize">
                    {member.role}
                  </span>
                </div>

                <div className="text-xs text-gray-400">
                  Joined: {formatDate(member.created_at)}
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
                  Delete Team Member
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-1">
                  This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-700 mb-3">
              Are you sure you want to delete the team member:{" "}
              <span className="font-semibold text-gray-900">
                {memberToDelete?.name}
              </span>
              ?
            </p>

            {memberToDelete?.store_name && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    Warning
                  </span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  This member is currently assigned to store:{" "}
                  {memberToDelete.store_name}. Deleting them will remove their
                  store assignment.
                </p>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <strong>Email:</strong> {memberToDelete?.email}
                </div>
                <div>
                  <strong>Role:</strong> {memberToDelete?.role}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  {memberToDelete?.is_active ? "Active" : "Inactive"}
                </div>
                {memberToDelete?.store_name && (
                  <div>
                    <strong>Store:</strong> {memberToDelete.store_name}
                  </div>
                )}
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isDeletingMember}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeletingMember}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeletingMember ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Member
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

      {members.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-xl text-gray-500 mb-2">
            {debouncedSearchTerm
              ? "No members match your search"
              : "No members found"}
          </p>
          <p className="text-gray-400">
            {debouncedSearchTerm
              ? "Try adjusting your search criteria"
              : "Add your first member to get started"}
          </p>
        </div>
      )}

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Assign Store
            </DialogTitle>
            <DialogDescription>
              Assign {assigningMember?.name} to a store
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignStore} className="space-y-4">
            <div>
              <Label htmlFor="assignStore">Store</Label>
              <Select
                value={formData.store_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, store_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isAssigningStore || !formData.store_id}
              >
                {isAssigningStore && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                Assign Store
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAssignDialogOpen(false);
                  setAssigningMember(null);
                  setFormData({ ...formData, store_id: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
