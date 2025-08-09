import type { DepositStatus, PaymentMethodType } from "@repo/db/types";
import { DataTable } from "@repo/ui/components/data-table";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar } from "@repo/ui/components/ui/calendar";
import { Input } from "@repo/ui/components/ui/input";
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
import { CalendarIcon, EyeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiClient } from "~/utils/axios";
import { formatDate, formatPrice } from "~/utils/format";

const columns: ColumnDef<DepositHistoryData>[] = [
  {
    accessorKey: "deposit_id",
    header: "ID Deposit",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
          {row.original.deposit_id}
        </code>
        <Link
          to={`/user/deposit/history/${row.original.deposit_id}`}
          className="text-primary hover:text-primary/80"
        >
          <EyeIcon className="w-4 h-4" />
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "amount_pay",
    header: "Jumlah Bayar",
    cell: ({ row }) => (
      <span className="font-semibold">
        {formatPrice(row.original.amount_pay)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusConfig: Record<string, string> = {
        pending:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400",
        success:
          "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400",
        completed:
          "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400",
        failed: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400",
        expired:
          "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
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
    accessorKey: "payment_method.name",
    header: "Metode Pembayaran",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-sm">{row.original.payment_method.name}</span>
        <span className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
          {row.original.payment_method.type.replace("_", " ").toUpperCase()}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Tanggal Dibuat",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.created_at)}</span>
    ),
  },
  {
    accessorKey: "expired_at",
    header: "Tanggal Kadaluarsa",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.expired_at ? formatDate(row.original.expired_at) : "-"}
      </span>
    ),
  },
];

export default function DepositHistory() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState<{
    deposit_id: string;
    start_date: Date | undefined;
    end_date: Date | undefined;
  }>({
    deposit_id: "",
    start_date: undefined,
    end_date: undefined,
  });

  const depositHistory = useQuery({
    queryKey: ["depositHistory", page, limit, filter],
    queryFn: async () =>
      apiClient
        .get<DepositHistoryResponse>("/deposit/history", {
          params: {
            page,
            limit,
            ...filter,
          },
        })
        .then((res) => res.data)
        .catch((err) => {
          throw err.response?.data || err;
        }),
  });

  useEffect(() => {
    //   set ke satu jika ada filter yang berubah
    if (filter.deposit_id || filter.start_date || filter.end_date) {
      setPage(1);
    }
  }, [page, limit, filter]);

  return (
    <>
      <section id="header">
        <div className="md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Detail Deposit
          </h1>
          <p className="text-muted-foreground">
            Informasi lengkap tentang deposit Anda
          </p>
        </div>
      </section>
      <section>
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="text"
            placeholder="Cari ID Deposit"
            value={filter.deposit_id}
            onChange={(e) =>
              setFilter({ ...filter, deposit_id: e.target.value })
            }
            className="w-full max-w-xs"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!filter.start_date}
                className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal border-border flex-1"
              >
                <CalendarIcon />
                {filter.start_date
                  ? formatDate(filter.start_date)
                  : "Pilih Tanggal Mulai"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filter.start_date}
                onSelect={(date) =>
                  setFilter({
                    ...filter,
                    start_date: date,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!filter.end_date}
                className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal border-border flex-1"
              >
                <CalendarIcon />
                {filter.end_date
                  ? formatDate(filter.end_date)
                  : "Pilih Tanggal Berakhir"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filter.end_date}
                onSelect={(date) =>
                  setFilter({
                    ...filter,
                    end_date: date,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <Select
            value={limit.toString()}
            onValueChange={(value) => setLimit(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Limit">{limit}</SelectValue>
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
        {depositHistory.isLoading && (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {depositHistory.isError && (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">
              {depositHistory.error.message || "Terjadi kesalahan"}
            </p>
          </div>
        )}

        {depositHistory.isSuccess && (
          <div className="grid mt-4">
            <DataTable columns={columns} data={depositHistory.data?.data} />
          </div>
        )}

        <div className="flex justify-between gap-4 mt-4">
          <div>
            <p className="text-sm">
              Page {depositHistory.data?.meta.pagination.page} of{" "}
              {depositHistory.data?.meta.pagination.total_pages}
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
              {depositHistory.data?.meta.pagination.page}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-border"
              disabled={
                page >= (depositHistory.data?.meta.pagination.total_pages ?? 1)
              }
              onClick={() =>
                setPage((prev) =>
                  Math.min(
                    prev + 1,
                    depositHistory.data?.meta.pagination.total_pages ?? 1,
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

export interface DepositHistoryResponse {
  success: boolean;
  message: string;
  data: DepositHistoryData[];
  meta: DepositHistoryMeta;
}

export interface DepositHistoryData {
  id: string;
  deposit_id: string;
  amount_pay: number;
  created_at: string;
  expired_at: string;
  status: DepositStatus;
  payment_method: DepositHistoryPaymentMethod;
}

export interface DepositHistoryPaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
}

export interface DepositHistoryMeta {
  pagination: DepositHistoryPagination;
}

export interface DepositHistoryPagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
