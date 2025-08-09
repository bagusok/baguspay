import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CopyIcon,
  CreditCardIcon,
  GamepadIcon,
  GiftIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  ReceiptIcon,
  RefreshCwIcon,
  TagIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "~/utils/axios";
import { formatPrice } from "~/utils/format";
import type { Route } from "./+types";
import CancelTransactionModal from "./cancel-transaction-modal";
import PaymentCountdown from "./payment-countdown";
import PaymentMethodDisplay from "./payment-method-display";
import StatusBadge from "./status-badge";

export default function OrderDetailPage({ params }: Route.ComponentProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const orderDetail = useQuery({
    queryKey: ["orderDetail", params.id],
    queryFn: async () =>
      apiClient
        .post<OrderDetailResponse>(`/order/${params.id}`)
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

  const handleCancelTransaction = async () => {
    if (!data) return;
  };

  const handleChatCS = () => {
    const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp CS
    const message = `Halo, saya ingin bertanya tentang transaksi dengan Order ID: ${data?.order_id}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (orderDetail.isLoading) {
    return (
      <div className="w-full md:max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat detail pesanan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (orderDetail.isError) {
    return (
      <div className="w-full md:max-w-7xl mx-auto">
        <div className="rounded-xl shadow-xs border border-red-200 p-8 dark:border-red-800/30 dark:bg-red-800/10 text-center">
          <XCircleIcon className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Gagal Memuat Detail Pesanan
          </h2>
          <p className="text-muted-foreground mb-4">
            {orderDetail.error?.message ||
              "Terjadi kesalahan saat memuat detail pesanan"}
          </p>
          <Button onClick={() => orderDetail.refetch()} className="gap-2">
            <RefreshCwIcon className="w-4 h-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  const data = orderDetail.data?.data;
  if (!data) return null;

  return (
    <div className="w-full md:max-w-7xl mx-auto space-y-4">
      {/* Header Section */}
      <section id="header">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Detail Pesanan
          </h1>
          <p className="text-muted-foreground">
            Informasi lengkap tentang pesanan Anda
          </p>
        </div>
      </section>

      {/* Payment Countdown - Priority Display */}
      {data.payment.expired_at &&
        (data.payment_status === "pending" ||
          data.payment_status === "expired" ||
          data.payment_status === "failed") && (
          <section id="payment-countdown">
            <PaymentCountdown
              expiredAt={data.payment.expired_at}
              paymentStatus={data.payment_status}
            />
          </section>
        )}

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-4">
          {/* Order Information Card */}
          <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
            <div className="inline-flex gap-2 items-center mb-4">
              <div className="rounded-full p-2 bg-primary">
                <ReceiptIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold">Status Pesanan</h2>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {data.order_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(data.order_id, "Order ID")}
                      className="p-1 h-auto"
                    >
                      <CopyIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge type="order" status={data.order_status} />
                <StatusBadge type="payment" status={data.payment_status} />
              </div>
            </div>
          </div>

          {/* Product Information Card */}
          <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
            <div className="inline-flex gap-2 items-center mb-4">
              <div className="rounded-full p-2 bg-primary">
                <GamepadIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold">Informasi Produk</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TagIcon className="w-4 h-4" />
                <span>
                  {data.product.category_name} •{" "}
                  {data.product.sub_category_name}
                </span>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-2">
                  {data.product.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500">
                    <GamepadIcon className="w-3 h-3" />
                    {data.product.billing_type === "prepaid"
                      ? "Prepaid"
                      : "Postpaid"}
                  </Badge>
                  <Badge className="rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500">
                    <CheckCircleIcon className="w-3 h-3" />
                    {data.product.fullfillment_type === "automatic_direct"
                      ? "Otomatis"
                      : "Manual"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">ID Akun</p>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-muted rounded text-sm font-mono flex-1">
                    {data.customer_input}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(data.customer_input, "ID Akun")
                    }
                    className="p-1 h-auto"
                  >
                    <CopyIcon className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {data.sn_number && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Serial Number
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-green-100 dark:bg-green-800/30 rounded text-sm font-mono flex-1 text-green-800 dark:text-green-400">
                      {data.sn_number}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(data.sn_number, "Serial Number")
                      }
                      className="p-1 h-auto"
                    >
                      <CopyIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information Card */}
          <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
            <div className="inline-flex gap-2 items-center mb-4">
              <div className="rounded-full p-2 bg-primary">
                <CreditCardIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold">Informasi Pembayaran</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Metode Pembayaran
                </p>
                <p className="font-medium">{data.payment.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{data.payment.email}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Nomor Telepon
                  </p>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{data.payment.phone_number}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Payment Method Display */}
              <PaymentMethodDisplay
                paymentMethod={{
                  name: data.payment.name || "Metode Pembayaran",
                  type: data.payment.type as any,
                  qr_code: data.payment.qr_code,
                  pay_url: data.payment.pay_url,
                  pay_code: data.payment.pay_code,
                }}
                paymentStatus={data.payment_status}
                orderStatus={data.order_status}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-4 md:sticky md:top-24">
            {/* Price Summary Card */}
            <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
              <div className="inline-flex gap-2 items-center mb-4">
                <div className="rounded-full p-2 bg-primary">
                  <TagIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-semibold">Rincian Harga</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Harga Produk</span>
                  <span className="text-sm font-medium">
                    {formatPrice(data.price)}
                  </span>
                </div>

                {data.offers && data.offers.length > 0 && (
                  <>
                    {data.offers.map((offer, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm flex items-center gap-1 text-green-600">
                          <GiftIcon className="w-3 h-3" />
                          {offer.name}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          -{formatPrice(offer.discount_total)}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                <div className="flex justify-between">
                  <span className="text-sm">Biaya Admin</span>
                  <span className="text-sm font-medium">
                    {formatPrice(data.fee)}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Pembayaran</span>
                    <span className="font-bold text-lg text-primary">
                      {formatPrice(data.total_price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(data.notes || data.voucher_code) && (
              <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
                <div className="inline-flex gap-2 items-center mb-4">
                  <div className="rounded-full p-2 bg-primary">
                    <AlertCircleIcon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold">Informasi Tambahan</h2>
                </div>

                <div className="space-y-3">
                  {data.voucher_code && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Kode Voucher
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono flex-1">
                          {data.voucher_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(data.voucher_code, "Kode Voucher")
                          }
                          className="p-1 h-auto"
                        >
                          <CopyIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {data.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Catatan
                      </p>
                      <p className="text-sm bg-muted p-3 rounded">
                        {data.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {data.payment_status === "pending" && (
                <Button
                  onClick={() => setShowCancelModal(true)}
                  variant="destructive"
                  className="w-full gap-2"
                  disabled={isCanceling}
                >
                  <XCircleIcon className="w-4 h-4" />
                  {isCanceling ? "Membatalkan..." : "Batalkan Transaksi"}
                </Button>
              )}

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => orderDetail.refetch()}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/50 text-foreground dark:border-primary/50"
                  disabled={orderDetail.isLoading}
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

      {/* Cancel Transaction Confirmation Modal */}
      <CancelTransactionModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onConfirm={handleCancelTransaction}
        isLoading={isCanceling}
        orderId={data.order_id}
      />
    </div>
  );
}

export interface OrderDetailResponse {
  success: boolean;
  message: string;
  data: OrderDetailData;
}

export interface OrderDetailData {
  order_id: string;
  order_status: string;
  payment_status: string;
  refund_status: string;
  price: number;
  total_price: number;
  discount_price: number;
  fee: number;
  sn_number: string;
  customer_input: string;
  customer_email: string;
  user_id: string;
  voucher_code: any;
  notes: any;
  product: OrderDetailProduct;
  payment: OrderDetailPayment;
  offers: OrderDetailOffer[];
}

export interface OrderDetailProduct {
  product_id: string;
  name: string;
  category_name: string;
  sub_category_name: string;
  price: number;
  provider_ref_id: string;
  fullfillment_type: string;
  billing_type: string;
}

export interface OrderDetailPayment {
  email: string;
  phone_number: string;
  payment_method_id: string;
  qr_code: string;
  type: string;
  pay_url: any;
  pay_code: any;
  name: string;
  fee_type: string;
  fee_static: number;
  fee_percentage: number;
  expired_at: Date | string;
}

export interface OrderDetailOffer {
  name: string;
  type: string;
  discount_percentage: number;
  discount_static: number;
  discount_maximum: number;
  discount_total: number;
}
