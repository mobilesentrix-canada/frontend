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
  Phone,
  Mail,
  Crown,
  Shield,
  Wrench,
  Building,
  Eye,
  CheckCircle,
  XCircle,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminMembers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
    addMemberError,
    updateMemberError,
    deleteMemberError,
  } = useMembers({
    page: currentPage,
    limit: pageLimit,
    role: "",
    search: debouncedSearchTerm,
    designation: designationFilter === "all" ? "" : designationFilter,
    status: statusFilter === "all" ? "" : statusFilter,
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
    phone_number: "",
    role: "user",
    designation: "viewer",
    store_id: "",
    password: "",
    confirmPassword: "",
    is_active: true,
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

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      if (editingMember) {
        const updateData: any = {
          name: formData.name,
          phone_number: formData.phone_number,
          role: formData.role,
          designation: formData.designation,
          is_active: formData.is_active,
          store_id:
            formData.store_id && formData.store_id !== "none"
              ? parseInt(formData.store_id)
              : undefined,
        };

        // Only include password if it's not empty
        if (formData.password.trim()) {
          updateData.password = formData.password;
          updateData.confirmPassword = formData.confirmPassword;
        }

        await updateMember(editingMember.id, updateData);
      } else {
        const memberData = {
          email: formData.email,
          password: formData.password || generatePassword(),
          confirmPassword:
            formData.confirmPassword || formData.password || generatePassword(),
          name: formData.name,
          phone_number: formData.phone_number,
          role: formData.role,
          designation: formData.designation,
          is_active: formData.is_active,
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
      phone_number: "",
      role: "user",
      designation: "viewer",
      store_id: "",
      password: "",
      confirmPassword: "",
      is_active: true,
    });
    setEditingMember(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone_number: member.phone_number || "",
      role: member.role || "member",
      designation: member.designation || "viewer",
      store_id: member.store_id ? member.store_id.toString() : "none",
      password: "",
      confirmPassword: "",
      is_active: member.is_active ?? true,
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

  const getDesignationConfig = (designation: string) => {
    switch (designation) {
      case "admin":
        return {
          icon: Crown,
          label: "Admin",
          color: "text-purple-600 bg-purple-100",
        };
      case "manager":
        return {
          icon: Shield,
          label: "Manager",
          color: "text-blue-600 bg-blue-100",
        };
      case "technician":
        return {
          icon: Wrench,
          label: "Technician",
          color: "text-green-600 bg-green-100",
        };
      case "frontdesk":
        return {
          icon: Building,
          label: "Front Desk",
          color: "text-orange-600 bg-orange-100",
        };
      case "viewer":
        return {
          icon: Eye,
          label: "Viewer",
          color: "text-gray-600 bg-gray-100",
        };
      default:
        return {
          icon: User,
          label: "Unknown",
          color: "text-gray-600 bg-gray-100",
        };
    }
  };

  const getStatusConfig = (isActive: boolean) => {
    return isActive
      ? {
          icon: CheckCircle,
          label: "Active",
          color: "text-green-600 bg-green-100",
        }
      : { icon: XCircle, label: "Inactive", color: "text-red-600 bg-red-100" };
  };

  // Only show full screen loading on initial page load, not during search/filter
  if (
    isLoading &&
    members.length === 0 &&
    currentPage === 1 &&
    !debouncedSearchTerm &&
    designationFilter === "all" &&
    statusFilter === "all"
  ) {
    return <Loading text="Loading members..." className="p-8" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Team Members
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your team members and their access levels
                </p>
                {pagination && (
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm text-gray-500">
                      {pagination.total} members total
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {members.filter((m) => m.is_active).length} active
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
                      onClick={() => resetForm()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">
                        {editingMember ? "Edit Member" : "Add New Member"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingMember
                          ? "Update member information"
                          : "Add a new team member to your organization"}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                            placeholder="Enter full name"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="email"
                            className="text-sm font-medium"
                          >
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            required
                            disabled={!!editingMember}
                            placeholder="email@company.com"
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
                          <Label className="text-sm font-medium">Role *</Label>
                          <Select
                            value={formData.role}
                            onValueChange={(value) =>
                              setFormData({ ...formData, role: value })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">
                            Designation *
                          </Label>
                          <Select
                            value={formData.designation}
                            onValueChange={(value) =>
                              setFormData({ ...formData, designation: value })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Crown className="w-4 h-4" />
                                  Admin
                                </div>
                              </SelectItem>
                              <SelectItem value="manager">
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Manager
                                </div>
                              </SelectItem>
                              <SelectItem value="technician">
                                <div className="flex items-center gap-2">
                                  <Wrench className="w-4 h-4" />
                                  Technician
                                </div>
                              </SelectItem>
                              <SelectItem value="frontdesk">
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4" />
                                  Front Desk
                                </div>
                              </SelectItem>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  Viewer
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-2">
                          <Label className="text-sm font-medium">
                            Store Assignment
                          </Label>
                          <Select
                            value={formData.store_id || "none"}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                store_id: value === "none" ? "" : value,
                              })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select a store (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                No Store Assignment
                              </SelectItem>
                              {stores.map((store) => (
                                <SelectItem
                                  key={store.id}
                                  value={store.id.toString()}
                                >
                                  {store.name} ({store.store_id})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {!editingMember && (
                          <>
                            <div>
                              <Label
                                htmlFor="password"
                                className="text-sm font-medium"
                              >
                                Password{" "}
                                {editingMember
                                  ? "(leave blank to keep current)"
                                  : "*"}
                              </Label>
                              <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    password: e.target.value,
                                  })
                                }
                                required={!editingMember}
                                placeholder={
                                  editingMember
                                    ? "Leave blank to keep current"
                                    : "Enter password"
                                }
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label
                                htmlFor="confirmPassword"
                                className="text-sm font-medium"
                              >
                                Confirm Password {editingMember ? "" : "*"}
                              </Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                required={
                                  !editingMember || formData.password !== ""
                                }
                                placeholder={
                                  editingMember
                                    ? "Leave blank to keep current"
                                    : "Confirm password"
                                }
                                className="mt-1"
                              />
                            </div>
                          </>
                        )}

                        <div className="col-span-2">
                          <Label className="text-sm font-medium">Status</Label>
                          <Select
                            value={formData.is_active ? "active" : "inactive"}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                is_active: value === "active",
                              })
                            }
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
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

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
                          className="flex-1"
                          disabled={isAddingMember || isUpdatingMember}
                        >
                          {(isAddingMember || isUpdatingMember) && (
                            <LoadingSpinner size="sm" className="mr-2" />
                          )}
                          {editingMember ? "Update" : "Create"} Member
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
                  placeholder="Search members by name, email, or phone..."
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
                    value={designationFilter}
                    onValueChange={setDesignationFilter}
                  >
                    <SelectTrigger className="w-32 border-gray-200">
                      <SelectValue placeholder="Designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="frontdesk">Front Desk</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-l border-gray-200 pl-3 flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </div>

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
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 ${
              isLoading ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            {members.map((member) => {
              const designationConfig = getDesignationConfig(
                member.designation || "viewer"
              );
              const statusConfig = getStatusConfig(member.is_active ?? true);
              const DesignationIcon = designationConfig.icon;
              const StatusIcon = statusConfig.icon;

              return (
                <Card
                  key={member.id}
                  className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.color}`}
                        >
                          <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                            {member.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-500 truncate">
                            {member.email}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

                  <CardContent className="space-y-4">
                    {member.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="truncate">{member.phone_number}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${designationConfig.color}`}
                      >
                        <DesignationIcon className="w-3 h-3" />
                        {designationConfig.label}
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate">
                          {member.store_name || "No store"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(member.created_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {members.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {debouncedSearchTerm ||
                designationFilter !== "all" ||
                statusFilter !== "all"
                  ? "No members match your criteria"
                  : "No team members yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {debouncedSearchTerm ||
                designationFilter !== "all" ||
                statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first team member"}
              </p>
              {!debouncedSearchTerm &&
                designationFilter === "all" &&
                statusFilter === "all" && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Member
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
                of {pagination.total} members
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === pagination.page ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className="min-w-[2.5rem]"
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
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

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {memberToDelete?.name}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {memberToDelete?.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span>{" "}
                  {memberToDelete?.phone_number || "Not set"}
                </div>
                <div>
                  <span className="font-medium">Role:</span>{" "}
                  {memberToDelete?.role}
                </div>
                <div>
                  <span className="font-medium">Designation:</span>{" "}
                  {memberToDelete?.designation || "viewer"}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  {memberToDelete?.is_active ? "Active" : "Inactive"}
                </div>
                <div>
                  <span className="font-medium">Store:</span>{" "}
                  {memberToDelete?.store_name || "No assignment"}
                </div>
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

      {/* Assign Store Dialog */}
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
              <Label htmlFor="assignStore" className="text-sm font-medium">
                Store
              </Label>
              <Select
                value={formData.store_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, store_id: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name} ({store.store_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAssignDialogOpen(false);
                  setAssigningMember(null);
                  setFormData({ ...formData, store_id: "" });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
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
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
