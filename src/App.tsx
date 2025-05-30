import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/AdminLayout";
import { StoreLayout } from "@/components/StoreLayout";


import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminStores from "@/pages/admin/AdminStores";
import AdminMembers from "@/pages/admin/AdminMembers";
import AdminOrders from "@/pages/admin/AdminOrders";
import StoreProducts from "@/pages/store/StoreProducts";
import ProductDetail from "@/pages/store/ProductDetail";
import StoreCart from "@/pages/store/StoreCart";
import StoreOrders from "@/pages/store/StoreOrders";
import StoreProfile from "@/pages/store/StoreProfile";
import StoreWishlist from "@/pages/store/StoreWishlist";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="stores" element={<AdminStores />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>
            <Route
              path="/store"
              element={
                <ProtectedRoute requiredRole="user">
                  <StoreLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StoreProducts />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<StoreCart />} />
              <Route path="orders" element={<StoreOrders />} />
              <Route path="profile" element={<StoreProfile />} />
              <Route path="wishlist" element={<StoreWishlist />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
