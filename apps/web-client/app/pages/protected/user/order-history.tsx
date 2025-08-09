import type { OrderStatus, PaymentStatus, RefundStatus } from "@repo/db/types";
import { DataTable } from "@repo/ui/components/data-table";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar } from "@repo/ui/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, EyeIcon, Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiClient } from "~/utils/axios";
import { formatDate, formatPrice } from "~/utils/format";

const columns: ColumnDef<OrederHistoryData>[] = [
  {
    accessorKey: "order_id",
    header: "ID Order",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
          {row.original.order_id}
        </code>
        <Link
          to={`/order/detail/${row.original.order_id}`}
          className="text-primary hover:text-primary/80"
        >
          <EyeIcon className="w-4 h-4" />
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "total_price",
    header: "Total Harga",
    cell: ({ row }) => (
      <span className="font-semibold">
        {formatPrice(row.original.total_price)}
      </span>
    ),
  },
  {
    accessorKey: "payment_status",
    header: "Status Pembayaran",
    cell: ({ row }) => {
      const status = row.original.payment_status;
      const statusConfig: Record<string, string> = {
        pending:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400",
        success:
          "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400",
        failed: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400",
        expired:
          "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
        cancelled:
          "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[status] || statusConfig.failed}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "order_status",
    header: "Status Order",
    cell: ({ row }) => {
      const status = row.original.order_status;
      const statusConfig: Record<string, string> = {
        none: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
        pending:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400",
        completed:
          "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400",
        cancelled:
          "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400",
        failed: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[status] || statusConfig.failed}`}
        >
          {status === "none"
            ? "None"
            : status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "refund_status",
    header: "Status Refund",
    cell: ({ row }) => {
      const status = row.original.refund_status;
      if (!status) return <span className="text-muted-foreground">-</span>;

      const statusConfig: Record<string, string> = {
        none: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
        processing:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400",
        completed:
          "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400",
        failed: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[status] || statusConfig.failed}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Tanggal Dibuat",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.created_at)}</span>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Tanggal Update",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.updated_at)}</span>
    ),
  },
];

export default function OrderHistoryPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState<{
    order_status: string;
    payment_status: string;
    refund_status: string;
    start_date: Date | undefined;
    end_date: Date | undefined;
    sort: string;
  }>({
    order_status: "",
    payment_status: "",
    refund_status: "",
    start_date: undefined,
    end_date: undefined,
    sort: "",
  });
  const [filter, setFilter] = useState<{
    order_id: string;
    order_status: string;
    payment_status: string;
    refund_status: string;
    start_date: Date | undefined;
    end_date: Date | undefined;
    sort: string;
  }>({
    order_id: "",
    order_status: "",
    payment_status: "",
    refund_status: "",
    start_date: undefined,
    end_date: undefined,
    sort: "",
  });

  // Count active filters
  const activeFiltersCount = [
    filter.order_status,
    filter.payment_status,
    filter.refund_status,
    filter.start_date,
    filter.end_date,
    filter.sort,
  ].filter(Boolean).length;

  const applyFilters = () => {
    setFilter((prev) => ({
      ...prev,
      ...tempFilter,
    }));
    setIsFilterDialogOpen(false);
  };

  const clearFilters = () => {
    const emptyFilters = {
      order_status: "",
      payment_status: "",
      refund_status: "",
      start_date: undefined,
      end_date: undefined,
      sort: "",
    };
    setTempFilter(emptyFilters);
    setFilter((prev) => ({
      ...prev,
      ...emptyFilters,
    }));
    setIsFilterDialogOpen(false);
  };

  const openFilterDialog = () => {
    setTempFilter({
      order_status: filter.order_status,
      payment_status: filter.payment_status,
      refund_status: filter.refund_status,
      start_date: filter.start_date,
      end_date: filter.end_date,
      sort: filter.sort,
    });
    setIsFilterDialogOpen(true);
  };

  const orderHistory = useQuery({
    queryKey: ["orderHistory", page, limit, filter],
    queryFn: async () =>
      apiClient
        .get<OrderHistoryResponse>("/order/history", {
          params: {
            page,
            limit,
            order_id: filter.order_id || undefined,
            order_status: filter.order_status || undefined,
            payment_status: filter.payment_status || undefined,
            refund_status: filter.refund_status || undefined,
            start_date: filter.start_date
              ? filter.start_date.toISOString().split("T")[0]
              : undefined,
            end_date: filter.end_date
              ? filter.end_date.toISOString().split("T")[0]
              : undefined,
            sort: filter.sort || undefined,
          },
        })
        .then((res) => res.data)
        .catch((err) => {
          throw err.response?.data || err;
        }),
    retry: 2,
  });

  useEffect(() => {
    // Set ke satu jika ada filter yang berubah
    if (
      filter.order_id ||
      filter.order_status ||
      filter.payment_status ||
      filter.refund_status ||
      filter.start_date ||
      filter.end_date ||
      filter.sort
    ) {
      setPage(1);
    }
  }, [filter]);

  return (
    <>
      <section id="header">
        <div className="md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Riwayat Orderan
          </h1>
          <p className="text-muted-foreground">
            Informasi lengkap tentang riwayat orderan Anda
          </p>
        </div>
      </section>
      <section>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Cari ID Order..."
              value={filter.order_id}
              onChange={(e) =>
                setFilter({ ...filter, order_id: e.target.value })
              }
              className="pl-10"
            />
          </div>

          {/* Filter Dialog */}
          <Dialog
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" onClick={openFilterDialog}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {activeFiltersCount > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Orderan</DialogTitle>
                <DialogDescription>
                  Pilih filter untuk menyaring data orderan
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Order Status */}
                <div className="space-y-2">
                  <Label>Status Order</Label>
                  <Select
                    value={tempFilter.order_status}
                    onValueChange={(value) =>
                      setTempFilter({
                        ...tempFilter,
                        order_status: value === "all" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status order">
                        {tempFilter.order_status || "Semua"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Status */}
                <div className="space-y-2">
                  <Label>Status Pembayaran</Label>
                  <Select
                    value={tempFilter.payment_status}
                    onValueChange={(value) =>
                      setTempFilter({
                        ...tempFilter,
                        payment_status: value === "all" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status pembayaran">
                        {tempFilter.payment_status || "Semua"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Refund Status */}
                <div className="space-y-2">
                  <Label>Status Refund</Label>
                  <Select
                    value={tempFilter.refund_status}
                    onValueChange={(value) =>
                      setTempFilter({
                        ...tempFilter,
                        refund_status: value === "all" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status refund">
                        {tempFilter.refund_status || "Semua"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Tanggal Mulai</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tempFilter.start_date
                            ? formatDate(tempFilter.start_date)
                            : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={tempFilter.start_date}
                          onSelect={(date) =>
                            setTempFilter({
                              ...tempFilter,
                              start_date: date,
                            })
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal Akhir</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tempFilter.end_date
                            ? formatDate(tempFilter.end_date)
                            : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={tempFilter.end_date}
                          onSelect={(date) =>
                            setTempFilter({
                              ...tempFilter,
                              end_date: date,
                            })
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <Label>Urutkan</Label>
                  <Select
                    value={tempFilter.sort}
                    onValueChange={(value) =>
                      setTempFilter({
                        ...tempFilter,
                        sort: value === "default" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih urutan">
                        {tempFilter.sort || "Default"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="created_at_desc">Terbaru</SelectItem>
                      <SelectItem value="created_at_asc">Terlama</SelectItem>
                      <SelectItem value="total_price_desc">
                        Harga Tertinggi
                      </SelectItem>
                      <SelectItem value="total_price_asc">
                        Harga Terendah
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={applyFilters}>Terapkan Filter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Limit Selection */}
          <Select
            value={limit.toString()}
            onValueChange={(value) => setLimit(Number(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue>{limit} per halaman</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per halaman</SelectItem>
              <SelectItem value="10">10 per halaman</SelectItem>
              <SelectItem value="20">20 per halaman</SelectItem>
              <SelectItem value="50">50 per halaman</SelectItem>
              <SelectItem value="100">100 per halaman</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {orderHistory.isLoading && (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {orderHistory.isError && (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">
              {orderHistory.error?.message || "Terjadi kesalahan"}
            </p>
          </div>
        )}

        {orderHistory.isSuccess && (
          <div className="grid mt-4">
            <DataTable columns={columns} data={orderHistory.data?.data || []} />
          </div>
        )}

        <div className="flex justify-between gap-4 mt-4">
          <div>
            <p className="text-sm">
              Page {orderHistory.data?.meta.pagination.page || 1} of{" "}
              {orderHistory.data?.meta.pagination.total_pages || 1}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Button
              size="sm"
              variant="outline"
              className="border-border"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <span className="font-bold">
              {orderHistory.data?.meta.pagination.page || 1}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-border"
              disabled={
                page >= (orderHistory.data?.meta.pagination.total_pages ?? 1)
              }
              onClick={() =>
                setPage((prev) =>
                  Math.min(
                    prev + 1,
                    orderHistory.data?.meta.pagination.total_pages ?? 1,
                  ),
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

export interface OrderHistoryResponse {
  success: boolean;
  message: string;
  data: OrederHistoryData[];
  meta: Meta;
}

export interface OrederHistoryData {
  id: string;
  order_id: string;
  total_price: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  refund_status: RefundStatus;
  created_at: string;
  updated_at: string;
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  total: number;
  total_pages: number;
  page: number;
  limit: number;
}
