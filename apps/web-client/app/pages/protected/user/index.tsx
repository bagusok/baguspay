import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3Icon,
  ClockIcon,
  CreditCardIcon,
  GamepadIcon,
  HistoryIcon,
  PhoneIcon,
  PlusIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import LinkWithLocale from "~/components/link";

import { apiClient } from "~/utils/axios";
import { formatDate, formatPrice } from "~/utils/format";

// Type definitions for the dashboard API response
interface ProductSnapshot {
  name: string;
  category_name: string;
  sub_category_name: string;
}

interface RecentOrder {
  order_id: string;
  total_price: number;
  order_status: "success" | "failed" | "pending" | "none";
  payment_status: "success" | "failed" | "pending" | "expired";
  customer_input: string;
  created_at: string;
  product_snapshot: ProductSnapshot;
}

interface PopularOrder {
  category_name: string;
  total: number;
}

interface DashboardData {
  balance: number;
  totalOrder: number;
  totalOrderPrice: number;
  totalPromoPrice: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  monthlyOrderSuccess: number;
  monthlyOrderSuccessPrice: number;
  monthlyOrderSuccessPromo: number;
  totalDeposit: number;
  recentOrders: RecentOrder[];
  popularOrders: PopularOrder[];
}

interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

export default function UserDashboard() {
  const dashboard = useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardResponse> =>
      apiClient
        .get("/user/dashboard")
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        }),
  });

  const getOrderStatusBadge = (orderStatus: string, paymentStatus: string) => {
    if (orderStatus === "success" && paymentStatus === "success") {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        >
          Berhasil
        </Badge>
      );
    } else if (orderStatus === "pending" || paymentStatus === "pending") {
      return <Badge variant="secondary">Diproses</Badge>;
    } else if (
      orderStatus === "failed" ||
      paymentStatus === "failed" ||
      paymentStatus === "expired"
    ) {
      return <Badge variant="destructive">Gagal</Badge>;
    } else {
      return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    if (
      categoryName.toLowerCase().includes("mobile legends") ||
      categoryName.toLowerCase().includes("game") ||
      categoryName.toLowerCase().includes("test")
    ) {
      return (
        <GamepadIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      );
    } else if (
      categoryName.toLowerCase().includes("pulsa") ||
      categoryName.toLowerCase().includes("telkomsel")
    ) {
      return (
        <PhoneIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
      );
    } else {
      return (
        <GamepadIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      );
    }
  };

  const censorCustomerInput = (input: string) => {
    if (!input) return input;

    // If it looks like a phone number (starts with 0 or +)
    if (input.startsWith("0") || input.startsWith("+")) {
      if (input.length > 6) {
        return input.slice(0, 4) + "****" + input.slice(-3);
      }
      return input.slice(0, 3) + "****";
    }

    // If it contains underscore (game ID format)
    if (input.includes("_")) {
      const parts = input.split("_");
      if (parts[0].length > 4) {
        parts[0] = parts[0].slice(0, 3) + "****" + parts[0].slice(-2);
      }
      return parts.join("_");
    }

    // For other formats
    if (input.length > 6) {
      return input.slice(0, 3) + "****" + input.slice(-2);
    } else if (input.length > 3) {
      return input.slice(0, 2) + "****";
    }

    return input;
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse bg-muted rounded h-4 w-20"></div>
  );

  const data = dashboard.data?.data;
  const isLoading = dashboard.isLoading;
  const isError = dashboard.isError;

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-500">Gagal memuat data dashboard</p>
          <Button
            variant="outline"
            onClick={() => dashboard.refetch()}
            className="mt-4"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang kembali! Kelola topup game dan pulsa Anda dengan
            mudah
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="gap-2">
            <LinkWithLocale to="/user/deposit">
              <PlusIcon className="w-4 h-4" />
              Deposit Sekarang
            </LinkWithLocale>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <LinkWithLocale to="/">
              <ShoppingCartIcon className="w-4 h-4" />
              Order Now
            </LinkWithLocale>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Current Balance */}
        <Card className="border-l-4 border-l-green-500 border-y-border border-r-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Saat Ini
            </CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <WalletIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                formatPrice(data?.balance || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Saldo tersedia</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border-l-4 border-l-blue-500 border-y-border border-r-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Nilai Order
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingCartIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                formatPrice(data?.totalOrderPrice ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{data?.totalOrder || 0}</span>{" "}
              total orderan
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="border-l-4 border-l-orange-500 border-y-border border-r-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promo</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <ClockIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                formatPrice(data?.totalPromoPrice ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total promo yang didapat
            </p>
          </CardContent>
        </Card>

        {/* Total Deposits */}
        <Card className="border-l-4 border-l-purple-500 border-y-border border-r-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposit</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CreditCardIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                formatPrice(data?.totalDeposit ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-purple-600">Total deposit Anda</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Order Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <HistoryIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                Orderan Terbaru
              </div>
              <Button variant="ghost" size="sm" asChild>
                <LinkWithLocale to="/user/orders">Lihat Semua</LinkWithLocale>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-muted rounded animate-pulse w-16"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : data?.recentOrders?.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                Belum ada orderan
              </div>
            ) : (
              data?.recentOrders?.slice(0, 3).map((order) => (
                <LinkWithLocale
                  to={`/order/detail/${order.order_id}`}
                  key={order.order_id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      {getCategoryIcon(order.product_snapshot.category_name)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        <span className="text-muted-foreground">
                          {order.product_snapshot.category_name}
                        </span>{" "}
                        - {order.product_snapshot.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {censorCustomerInput(order.customer_input)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getOrderStatusBadge(
                      order.order_status,
                      order.payment_status,
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPrice(order.total_price)}
                    </p>
                  </div>
                </LinkWithLocale>
              ))
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <BarChart3Icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              Statistik Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Success Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tingkat Keberhasilan</span>
                <span className="font-semibold text-green-600">
                  {isLoading
                    ? "Loading..."
                    : data?.totalOrder && data.totalOrder > 0
                      ? `${Math.round((data.monthlyOrderSuccess / data.totalOrder) * 100)}%`
                      : "0%"}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width:
                      data?.totalOrder && data.totalOrder > 0
                        ? `${(data.monthlyOrderSuccess / data.totalOrder) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>
            </div>

            {/* Popular Category */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Kategori Populer</p>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : data?.popularOrders?.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Belum ada data
                  </div>
                ) : (
                  data?.popularOrders?.map((category, index) => {
                    const totalOrders = data.popularOrders.reduce(
                      (sum, cat) => sum + cat.total,
                      0,
                    );
                    const percentage =
                      totalOrders > 0
                        ? Math.round((category.total / totalOrders) * 100)
                        : 0;
                    const colors = [
                      "bg-purple-500",
                      "bg-green-500",
                      "bg-blue-500",
                      "bg-orange-500",
                      "bg-red-500",
                    ];

                    return (
                      <div
                        key={category.category_name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}
                          ></div>
                          <span className="text-sm">
                            {category.category_name}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Monthly Spending */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Pengeluaran Bulan Ini
                </span>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  formatPrice(Math.abs(data?.monthlyExpenses ?? 0))
                )}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Total pembelian bulan ini
              </p>
            </div>

            {/* Monthly Income */}
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <WalletIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Pemasukan Bulan Ini
                </span>
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  formatPrice(data?.monthlyIncome ?? 0)
                )}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Total deposit bulan ini
              </p>
            </div>

            {/* Total Discount Saved */}
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <CreditCardIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Total Promo Dihemat
                </span>
              </div>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  formatPrice(data?.monthlyOrderSuccessPromo ?? 0)
                )}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Hemat dari promo bulan ini
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
