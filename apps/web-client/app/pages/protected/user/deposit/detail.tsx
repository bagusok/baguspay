import { DepositStatus } from "@repo/db/types";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  CreditCardIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  ReceiptIcon,
  RefreshCwIcon,
  WalletIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "~/utils/axios";
import { formatPrice } from "~/utils/format";
import type { Route } from "./+types/detail";

export default function DepositDetail({ params }: Route.ComponentProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const depositDetail = useQuery({
    queryKey: ["depositDetail", params.id],
    queryFn: async () =>
      apiClient
        .get<DepositDetailResponse>(`/deposit/${params.id}`)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data;
        }),
    retry: false,
  });

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      toast.success(`${fieldName} disalin ke clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleChatCS = () => {
    const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp CS
    const message = `Halo, saya ingin bertanya tentang deposit dengan ID: ${data?.deposit_id}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    switch (normalizedStatus) {
      case DepositStatus.PENDING:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400">
            <ClockIcon className="w-3 h-3 mr-1" />
            Menunggu Pembayaran
          </Badge>
        );
      case DepositStatus.COMPLETED:
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Berhasil
          </Badge>
        );
      case DepositStatus.FAILED:
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Gagal
          </Badge>
        );
      case DepositStatus.EXPIRED:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400">
            <ClockIcon className="w-3 h-3 mr-1" />
            Kadaluarsa
          </Badge>
        );
      case DepositStatus.CANCELED:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Dibatalkan
          </Badge>
        );

      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (depositDetail.isLoading) {
    return (
      <div className="w-full md:max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat detail deposit...</p>
          </div>
        </div>
      </div>
    );
  }

  if (depositDetail.isError) {
    return (
      <div className="w-full md:max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-xl shadow-xs border border-red-200 p-8 dark:border-red-800/30 dark:bg-red-800/10 text-center">
          <XCircleIcon className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Gagal Memuat Detail Deposit
          </h2>
          <p className="text-muted-foreground mb-4">
            {depositDetail.error?.message ||
              "Terjadi kesalahan saat memuat detail deposit"}
          </p>
          <Button onClick={() => depositDetail.refetch()} className="gap-2">
            <RefreshCwIcon className="w-4 h-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  const data = depositDetail.data?.data;
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Header Section */}
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

      {data.expired_at && data.status === "pending" && (
        <section id="payment-countdown">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800/30 dark:bg-orange-800/10">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800 dark:text-orange-400">
                Segera Lakukan Pembayaran
              </h3>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Batas waktu pembayaran:{" "}
              {new Date(data.expired_at).toLocaleString("id-ID")}
            </p>
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-4">
          {/* Deposit Information Card */}
          <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
            <div className="inline-flex gap-2 items-center mb-4">
              <div className="rounded-full p-2 bg-primary">
                <WalletIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold">Status Deposit</h2>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Deposit ID</p>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {data.deposit_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(data.deposit_id, "Deposit ID")
                      }
                      className="p-1 h-auto"
                    >
                      <CopyIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(data.status)}
              </div>
            </div>
          </div>

          {/* Payment Method Information Card */}
          <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
            <div className="inline-flex gap-2 items-center mb-4">
              <div className="rounded-full p-2 bg-primary">
                <CreditCardIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold">Informasi Pembayaran</h2>
            </div>

            <div className="space-y-4">
              {/* Payment Method Display */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <img
                  src={
                    data.payment_method.image_url?.startsWith("http")
                      ? data.payment_method.image_url
                      : `https://is3.cloudhost.id/bagusok${data.payment_method.image_url}`
                  }
                  alt={data.payment_method.name}
                  className="w-12 h-12 object-contain rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold">{data.payment_method.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.payment_method.type.replace("_", " ").toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{data.email}</span>
                  </div>
                </div>
                {data.phone_number && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Nomor Telepon
                    </p>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{data.phone_number}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              {(data.pay_code || data.pay_url || data.qr_code) && (
                <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-400">
                    Detail Pembayaran
                  </h4>

                  {data.pay_code && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Kode Pembayaran
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-2 bg-white dark:bg-gray-800 rounded text-lg font-mono flex-1 border">
                          {data.pay_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(data.pay_code, "Kode Pembayaran")
                          }
                          className="p-2 h-auto"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {data.pay_url && (
                    <div>
                      <Button
                        onClick={() => window.open(data.pay_url, "_blank")}
                        className="w-full"
                      >
                        Lanjutkan Pembayaran
                      </Button>
                    </div>
                  )}

                  {data.qr_code && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-2">
                        Scan QR Code untuk membayar
                      </p>
                      <div className="inline-block p-2 bg-white rounded-lg">
                        <img
                          src={data.qr_code}
                          alt="QR Code"
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              {data.payment_method.instruction && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">
                    Cara Pembayaran
                  </h4>
                  <div
                    className="text-sm text-amber-700 dark:text-amber-300"
                    dangerouslySetInnerHTML={{
                      __html: data.payment_method.instruction,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-4 md:sticky md:top-24">
            {/* Amount Summary Card */}
            <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
              <div className="inline-flex gap-2 items-center mb-4">
                <div className="rounded-full p-2 bg-primary">
                  <WalletIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-semibold">Rincian Deposit</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Jumlah Deposit</span>
                  <span className="text-sm font-medium">
                    {formatPrice(data.amount_received)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Biaya Admin</span>
                  <span className="text-sm font-medium">
                    {formatPrice(data.amount_fee)}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Pembayaran</span>
                    <span className="font-bold text-lg text-primary">
                      {formatPrice(data.amount_pay)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamp Information */}
            <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
              <div className="inline-flex gap-2 items-center mb-4">
                <div className="rounded-full p-2 bg-primary">
                  <AlertCircleIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-semibold">Informasi Waktu</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Dibuat pada
                  </p>
                  <p className="text-sm">
                    {new Date(data.created_at).toLocaleString("id-ID")}
                  </p>
                </div>

                {data.expired_at && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Batas Pembayaran
                    </p>
                    <p className="text-sm">
                      {new Date(data.expired_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Terakhir Diperbarui
                  </p>
                  <p className="text-sm">
                    {new Date(data.updated_at).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => depositDetail.refetch()}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/50 text-foreground dark:border-primary/50"
                  disabled={depositDetail.isLoading}
                >
                  <RefreshCwIcon className="w-4 h-4" />
                  Refresh
                </Button>

                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/50 text-foreground dark:border-primary/50"
                >
                  <ReceiptIcon className="w-4 h-4" />
                  Cetak
                </Button>
              </div>

              {/* Support Action */}
              <Button
                onClick={handleChatCS}
                variant="outline"
                className="w-full gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 dark:border-green-800/30"
              >
                <MessageCircleIcon className="w-4 h-4" />
                Butuh Bantuan? Chat CS
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface DepositDetailResponse {
  success: boolean;
  message: string;
  data: DeposiDetailData;
}

export interface DeposiDetailData {
  deposit_id: string;
  payment_method_id: string;
  amount_pay: number;
  amount_received: number;
  amount_fee: number;
  phone_number: any;
  email: string;
  status: DepositStatus;
  pay_code: string;
  pay_url: any;
  qr_code: any;
  expired_at: string;
  created_at: string;
  updated_at: string;
  payment_method: DepositDetailPaymentMethod;
}

export interface DepositDetailPaymentMethod {
  name: string;
  image_url: string;
  type: string;
  is_need_phone_number: boolean;
  is_need_email: boolean;
  instruction: string;
}
