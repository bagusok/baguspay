import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import {
  BuildingIcon,
  ChevronRightIcon,
  CreditCardIcon,
  SmartphoneIcon,
  StarIcon,
  StoreIcon,
  WalletIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import toast from "react-hot-toast";
import { userAtom } from "~/store/user";
import { apiClient } from "~/utils/axios";
import { formatPrice } from "~/utils/format";
import type { OrderProducts } from "./slug";

type Props = {
  products: OrderProducts | null;
  form: UseFormReturn<any>;
};

type PaymentItem = {
  id: string;
  name: string;
  fee_percentage: number;
  fee_static: number;
  is_available: boolean;
  cut_off_start: string;
  cut_off_end: string;
  image_url: string;
  label: string | null;
  is_featured: boolean;
  min_amount: number;
  max_amount: number;
  is_need_email: boolean;
  is_need_phone_number: boolean;
  payment_fee: number;
  product_price: number;
  discount: number;
  total: number;
};

type PaymentMethod = {
  name: string;
  items: PaymentItem[];
};

const getPaymentIcon = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case "balance":
      return <WalletIcon className="w-5 h-5" />;
    case "qris":
      return <SmartphoneIcon className="w-5 h-5" />;
    case "transfer bank":
      return <BuildingIcon className="w-5 h-5" />;
    case "e wallet":
      return <CreditCardIcon className="w-5 h-5" />;
    case "gerai retail":
      return <StoreIcon className="w-5 h-5" />;
    default:
      return <CreditCardIcon className="w-5 h-5" />;
  }
};

export default function PaymentSection({ products, form }: Props) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = useAtomValue(userAtom);

  const paymentMethods = useMutation({
    mutationKey: ["paymentMethods", products?.id],
    mutationFn: async () =>
      apiClient
        .post("/order/products/price", {
          product_id: products?.id,
        })
        .then((res) => res.data)
        .catch((error) => {
          throw new Error(
            error.response?.data?.message || "Failed to fetch payment methods",
          );
        }),
  });

  useEffect(() => {
    if (products) {
      paymentMethods.mutate();
      setSelectedPayment(null);
      form.setValue("payment_method_id", "");
    }
  }, [products, form]);

  // Memoized calculations for user state and payment options
  const userState = useMemo(() => {
    const isGuest = !user.data?.role || user.data.role === "guest";
    const userBalance = user.data?.balance || 0;
    return { isGuest, userBalance };
  }, [user.data]);

  const paymentOptions = useMemo(() => {
    if (
      !paymentMethods.isSuccess ||
      !paymentMethods.data?.data?.payment_methods
    ) {
      return { balanceItem: null, cheapestItem: null };
    }

    const paymentMethodsData = paymentMethods.data.data.payment_methods;

    // Find balance method
    const balanceMethod = paymentMethodsData.find(
      (method: PaymentMethod) => method.name === "BALANCE",
    );
    const balanceItem = balanceMethod?.items?.[0] || null;

    // Find cheapest non-balance payment
    const allAvailableItems: PaymentItem[] = [];
    paymentMethodsData.forEach((method: PaymentMethod) => {
      if (method.items) {
        method.items.forEach((item: PaymentItem) => {
          if (item.is_available && method.name !== "BALANCE") {
            allAvailableItems.push(item);
          }
        });
      }
    });

    const cheapestItem =
      allAvailableItems.sort((a, b) => a.total - b.total)[0] || null;

    return { balanceItem, cheapestItem };
  }, [paymentMethods.isSuccess, paymentMethods.data]);

  // Auto-select payment method after data is loaded
  useEffect(() => {
    if (
      !selectedPayment &&
      (paymentOptions.balanceItem || paymentOptions.cheapestItem)
    ) {
      const { balanceItem, cheapestItem } = paymentOptions;
      const { isGuest, userBalance } = userState;

      if (
        !isGuest &&
        balanceItem?.is_available &&
        userBalance >= balanceItem.total
      ) {
        // Non-guest users auto-select balance if available and sufficient balance
        setSelectedPayment(balanceItem);
        form.setValue("payment_method_id", balanceItem.id);
      } else if (cheapestItem) {
        // Guest users or if balance unavailable/insufficient, select cheapest available payment
        setSelectedPayment(cheapestItem);
        form.setValue("payment_method_id", cheapestItem.id);
      }
    }
  }, [selectedPayment, paymentOptions, userState, form]);

  const handleSelectPayment = (item: PaymentItem) => {
    const { isGuest, userBalance } = userState;

    // Check if this item belongs to BALANCE method
    const isBalanceItem = paymentMethods.data?.data?.payment_methods?.some(
      (method: PaymentMethod) =>
        method.name === "BALANCE" &&
        method.items?.some((i: PaymentItem) => i.id === item.id),
    );

    const isInsufficientBalance = isBalanceItem && userBalance < item.total;

    if (
      item.is_available &&
      !(isBalanceItem && isGuest) &&
      !isInsufficientBalance
    ) {
      setSelectedPayment(item);
      form.setValue("payment_method_id", item.id);
      setIsModalOpen(false); // Close modal after selection
    }
  };

  // Sort payment methods to put BALANCE first (memoized)
  const sortedPaymentMethods = useMemo(() => {
    return (
      paymentMethods.data?.data?.payment_methods?.sort(
        (a: PaymentMethod, b: PaymentMethod) => {
          if (a.name === "BALANCE") return -1;
          if (b.name === "BALANCE") return 1;
          return 0;
        },
      ) || []
    );
  }, [paymentMethods.data]);

  return (
    <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800/50 text-secondary-foreground">
      <div className="flex items-center gap-2 mb-4">
        <CreditCardIcon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Metode Pembayaran
        </h2>
      </div>

      {/* Payment Method Display/Selector */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Button
          type="button"
          onClick={() => {
            if (products) {
              setIsModalOpen(true);
            } else {
              toast("Silakan pilih produk terlebih dahulu", {
                icon: "⚠️",
              });
            }
          }}
          variant="outline"
          className="w-full justify-between p-4 h-auto border-dashed border-2 hover:border-primary/50 transition-all duration-200"
        >
          {selectedPayment ? (
            <div className="flex items-center gap-3">
              <img
                src={
                  selectedPayment.image_url.startsWith("http")
                    ? selectedPayment.image_url
                    : `https://is3.cloudhost.id/bagusok${selectedPayment.image_url}`
                }
                alt={selectedPayment.name}
                className="w-10 rounded object-cover"
              />
              <div className="text-left">
                <p className="font-medium text-sm">{selectedPayment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(selectedPayment.total)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCardIcon className="w-5 h-5" />
              <span>Pilih Metode Pembayaran</span>
            </div>
          )}
          <ChevronRightIcon className="w-4 h-4" />
        </Button>

        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5" />
              Pilih Metode Pembayaran
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {paymentMethods.isPending && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">
                  Memuat metode pembayaran...
                </span>
              </div>
            )}

            {paymentMethods.isError && (
              <div className="text-center py-8">
                <p className="text-destructive text-sm">
                  Error: {paymentMethods.error.message}
                </p>
              </div>
            )}

            {paymentMethods.isSuccess && (
              <Accordion type="multiple" className="w-full space-y-2">
                {sortedPaymentMethods.map((method: PaymentMethod) => {
                  const hasItems = method.items && method.items.length > 0;
                  const { isGuest, userBalance } = userState;
                  const isBalance = method.name === "BALANCE";

                  // Make balance unavailable for guests
                  const effectiveHasItems =
                    isBalance && isGuest ? false : hasItems;

                  return (
                    <AccordionItem
                      key={method.name}
                      value={method.name}
                      className="border border-border dark:border-slate-400 rounded-lg"
                      disabled={!effectiveHasItems}
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                        <div className="flex items-center gap-3 w-full">
                          <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                            {getPaymentIcon(method.name)}
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-medium">{method.name}</p>

                            {isBalance && isGuest && (
                              <p className="text-xs text-muted-foreground">
                                Login untuk menggunakan saldo
                              </p>
                            )}
                            {!isBalance && (
                              <p className="text-xs text-muted-foreground">
                                {effectiveHasItems
                                  ? `${method.items.length} opsi tersedia`
                                  : "Tidak tersedia"}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {method.items.some((item) => item.is_featured) && (
                              <Badge variant="secondary" className="text-xs">
                                <StarIcon className="w-3 h-3 mr-1" />
                                Rekomendasi
                              </Badge>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>

                      {effectiveHasItems && (
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-2 pt-2">
                            {method.items.map((item: PaymentItem) => {
                              const { userBalance } = userState;
                              // Check if balance is insufficient for balance payment
                              const isInsufficientBalance =
                                isBalance && userBalance < item.total;
                              const itemAvailable =
                                item.is_available && !(isBalance && isGuest);

                              return (
                                <div
                                  key={item.id}
                                  onClick={() =>
                                    itemAvailable &&
                                    !isInsufficientBalance &&
                                    handleSelectPayment(item)
                                  }
                                  className={`
                                    relative p-3 rounded-lg border cursor-pointer transition-all duration-200 group
                                    ${
                                      selectedPayment?.id === item.id
                                        ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20 dark:bg-primary/10 dark:border-primary/60"
                                        : "border-slate-400 hover:border-primary/50 dark:hover:border-primary/40 dark:hover:opacity-65"
                                    }
                                    ${
                                      !itemAvailable || isInsufficientBalance
                                        ? "opacity-60 cursor-not-allowed grayscale"
                                        : "hover:shadow-sm"
                                    }
                                  `}
                                >
                                  {/* Unavailable Overlay */}
                                  {(!itemAvailable ||
                                    isInsufficientBalance) && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
                                      <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">
                                        {isBalance && isGuest
                                          ? "Login Required"
                                          : isInsufficientBalance
                                            ? "Saldo Tidak Cukup"
                                            : "Tidak Tersedia"}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-3">
                                    <div className="relative shrink-0">
                                      <img
                                        src={
                                          item.image_url.startsWith("http")
                                            ? item.image_url
                                            : `https://is3.cloudhost.id/bagusok${item.image_url}`
                                        }
                                        alt={item.name}
                                        className="w-12  object-cover"
                                      />
                                      {item.is_featured && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                          <StarIcon className="w-2 h-2 text-white" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <p className="font-medium text-sm truncate ">
                                          {item.name}
                                        </p>
                                        {item.label && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs shrink-0 dark:border-gray-500 dark:text-gray-300"
                                          >
                                            {item.label}
                                          </Badge>
                                        )}
                                      </div>

                                      {/* Show balance info for balance payment */}
                                      {isBalance && !isGuest && (
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground ">
                                            Saldo Anda:{" "}
                                            {formatPrice(userBalance)}
                                          </p>
                                          {isInsufficientBalance && (
                                            <p className="text-xs text-destructive dark:text-red-400">
                                              Silahkan isi saldo terlebih dahulu
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      {/* Show payment fee if exists */}
                                      {item.payment_fee > 0 && (
                                        <p className="text-xs text-muted-foreground ">
                                          Biaya admin:{" "}
                                          {formatPrice(item.payment_fee)}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex flex-col items-end justify-center text-right shrink-0">
                                      {/* Show original price if there's discount */}
                                      {item.discount > 0 && (
                                        <p className="text-xs line-through text-muted-foreground">
                                          {formatPrice(item.product_price)}
                                        </p>
                                      )}
                                      <p className="text-lg font-bold text-primary">
                                        {formatPrice(item.total)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      )}
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Payment Summary */}
      {selectedPayment && (
        <div className="mt-4 space-y-4">
          {/* Order Summary */}
          {products && (
            <div className="p-3 bg-muted/30 border border-muted rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CreditCardIcon className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Rincian Pesanan
                </p>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={
                    products.image_url?.startsWith("http")
                      ? products.image_url
                      : `https://is3.cloudhost.id/bagusok${products.image_url}`
                  }
                  alt={products.name}
                  className="w-12 h-12 rounded-lg object-cover border border-border"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{products.name}</p>
                  {products.sub_name && (
                    <p className="text-xs text-muted-foreground">
                      {products.sub_name}
                    </p>
                  )}
                  {products.sku_code && (
                    <p className="text-xs text-muted-foreground">
                      SKU: {products.sku_code}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {formatPrice(products.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">Qty: 1</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-3 border-t border-muted">
                <div className="flex justify-between text-sm">
                  <span>Harga Produk</span>
                  <span>{formatPrice(selectedPayment.product_price)}</span>
                </div>

                {selectedPayment.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>
                      Diskon (
                      {Math.round(
                        (selectedPayment.discount /
                          selectedPayment.product_price) *
                          100,
                      )}
                      %)
                    </span>
                    <span>-{formatPrice(selectedPayment.discount)}</span>
                  </div>
                )}

                {selectedPayment.payment_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Biaya Admin</span>
                    <span>{formatPrice(selectedPayment.payment_fee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold pt-2 border-t border-muted">
                  <span>Total Pembayaran</span>
                  <span className="text-primary">
                    {formatPrice(selectedPayment.total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
