import React, { useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDashboard } from "@/hooks/useDashboard";
import { Loading } from "@/components/ui/loading";
import {
  TrendingUp,
  Users,
  Store as StoreIcon,
  Clock,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stores, members, orders, isLoading, error, stats, refetch } =
    useDashboard();
  useEffect(() => {
    refetch();
  }, [location.pathname]);

  if (isLoading) {
    return <Loading text="Loading dashboard..." className="p-8" />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statCards = [
    {
      title: "Approved Orders",
      value: stats?.approvedOrders || 0,
      description: "Orders successfully completed",
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      description: "Orders awaiting review",
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      change: "-3%",
      changeType: "decrease",
    },
    {
      title: "Total Stores",
      value: stats?.totalStores || 0,
      description: "Number of active stores",
      icon: StoreIcon,
      color: "from-blue-500 to-blue-600",
      change: "+5%",
      changeType: "increase",
    },
    {
      title: "Total Members",
      value: stats?.totalMembers || 0,
      description: "All registered members",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      change: "+10%",
      changeType: "increase",
    },
  ];

  const handleNavigation = (orderId) => {
    if (orderId) {
      navigate(`/admin/orders/${orderId}`);
    }
  };
  return (
    <div className="px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back! Here's what's happening with your business
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards?.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>

                <CardTitle className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </CardTitle>
              </div>
              <CardDescription className="text-sm font-medium text-gray-600 mt-3">
                {stat.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-500">{stat.description}</p>
            </CardContent>
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}
            />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  Recent Orders
                </CardTitle>
                <CardDescription>
                  Latest transactions from your stores
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order?.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  onClick={() => handleNavigation(order?.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {order?.store_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      {/* <p className="font-semibold text-gray-900">
                        {order?.product_names[0]}
                      </p> */}
                      <p className="font-semibold text-gray-900">
                        {order?.store_name} ({order?.items_count} Product)
                      </p>
                      <p className="text-sm text-gray-600">
                        {order?.user_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-1">
                        {order?.status === "pending" && (
                          <Clock className="w-3 h-3 text-yellow-500" />
                        )}
                        {order?.status === "approved" && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                        {order?.status === "rejected" && (
                          <AlertCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            order?.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order?.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order?.status?.charAt(0).toUpperCase() +
                            order?.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <StoreIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  Latest Store
                </CardTitle>
                <CardDescription>Member distribution</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stores.slice(0, 5).map((store, index) => (
                <div key={store.storeId} className="relative">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index % 4 === 0
                            ? "bg-blue-500"
                            : index % 4 === 1
                            ? "bg-green-500"
                            : index % 4 === 2
                            ? "bg-purple-500"
                            : "bg-orange-500"
                        }`}
                      >
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {store.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {store.storeId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">
                        {store.memberCount}
                      </p>
                      <p className="text-xs text-gray-500">members</p>
                    </div>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 h-1 rounded-full ${
                      index % 4 === 0
                        ? "bg-blue-500"
                        : index % 4 === 1
                        ? "bg-green-500"
                        : index % 4 === 2
                        ? "bg-purple-500"
                        : "bg-orange-500"
                    }`}
                    style={{
                      width: `${100}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
