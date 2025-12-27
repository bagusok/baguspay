import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { atom, useAtom, useAtomValue } from "jotai";
import { CircleCheckIcon, Clock, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { apiClient } from "~/utils/axios";
import { formatPrice, formatTime } from "~/utils/format";
import type { PreCheckoutForm } from "./slug";

type Props = {
  data: PreCheckoutData;
};

export const isOpenModalCheckout = atom(false);
export const preCheckoutTimeAtom = atom<number>(Date.now());
export const checkoutTokenAtom = atom<string | null>(null);
export const inquiryIdAtom = atom<string | null>(null);
export const preCheckoutRequestDataAtom = atom<PreCheckoutForm | null>(null);

export default function CheckoutModal({ data }: Props) {
  const [isOpen, setIsOpen] = useAtom(isOpenModalCheckout);
  const preCheckoutTime = useAtomValue(preCheckoutTimeAtom);
  const [timeLeft, setTimeLeft] = useState(360);
  const checkoutToken = useAtomValue(checkoutTokenAtom);
  const inquiryId = useAtomValue(inquiryIdAtom);
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, setIsOpen]);

  const checkout = useMutation({
    mutationKey: ["checkout"],
    mutationFn: async () =>
      apiClient
        .post(
          "/v2/order/checkout",
          {
            inquiry_id: inquiryId,
            checkout_token: checkoutToken,
          },
          {
            headers: {
              "X-Time": preCheckoutTime,
            },
          },
        )
        .then((res) => res.data)
        .catch((error) => {
          toast.error(error.response?.data?.message || "Checkout failed");
          throw error;
        }),
    onSuccess: (data) => {
      toast.success("Checkout successful!");
      setIsOpen(false);
      navigate(`/order/detail/${data.data.order_id}`);
    },
  });

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(360);
    }
  }, [isOpen]);

  if (!data) return null;

  const isTimeRunningOut = timeLeft <= 60; // Last minute warning

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <DialogContent
        className="max-w-sm mx-auto p-6 gap-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="text-start">Konfirmasi Pesanan</DialogTitle>
          <div
            role="timer"
            aria-live="polite"
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
              isTimeRunningOut
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <Clock className="w-3 h-3" aria-hidden="true" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </DialogHeader>

        {/* Content */}
        <div id="dialog-description" className="space-y-6 mt-4">
          {/* Product & Price Summary */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Produk:</span>
              <span className="font-medium text-right">
                {data.product?.category} - {data.product?.name}
              </span>
            </div>

            {/* Input Fields - compact */}
            {(data.input_fields ?? []).map((field, index) => (
              <div
                key={field.name ?? index}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-600 capitalize">{field.name}:</span>
                <span className="font-medium text-right max-w-[60%] wrap-break-word">
                  {field.value}
                </span>
              </div>
            ))}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pembayaran:</span>
              <span className="font-medium">{data.payment_method?.name}</span>
            </div>
          </div>

          <hr className="border-slate-300" />

          {/* Price Breakdown - Simple */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Harga Produk:</span>
              <span>{formatPrice(data.product_price)}</span>
            </div>

            {data.fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Biaya Admin:</span>
                <span>{formatPrice(data.fee)}</span>
              </div>
            )}

            {data.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Diskon:</span>
                <span className="text-green-600">
                  -{formatPrice(data.discount)}
                </span>
              </div>
            )}

            {(data.offers ?? []).map((offer, index) => (
              <div
                key={offer.name ?? index}
                className="flex justify-between text-xs"
              >
                <span className="text-gray-600">&nbsp; - {offer.name}:</span>
                <span className="text-green-600">
                  -{formatPrice(offer.total_discount)}
                </span>
              </div>
            ))}

            <hr className="border-slate-300" />

            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Total:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatPrice(data.total_price)}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4 grid grid-cols-2">
          <DialogClose asChild>
            <Button
              type="button"
              className="w-full"
              variant="destructive"
              size="sm"
            >
              <XIcon /> Batalkan
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="w-full"
            size="sm"
            onClick={() => checkout.mutate()}
            disabled={checkout.isPending}
          >
            <CircleCheckIcon />
            {checkout.isPending ? "Memproses..." : "Konfirmasi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export interface PreCheckoutResponse {
  success: boolean;
  message: string;
  data: PreCheckoutData;
}

export interface PreCheckoutData {
  inquiry_id: string;
  product: Product;
  payment_method: PaymentMethod;
  offers: Offer[];
  input_fields: InputField[];
  merged_input: string;
  product_price: number;
  fee: number;
  discount: number;
  total_price: number;
  checkout_token: string;
}

export interface Product {
  category: string;
  sub_category: string;
  name: string;
  price: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
}

export interface Offer {
  name: string;
  type: string;
  discount_percentage: number;
  discount_static: number;
  discount_maximum: number;
  total_discount: number;
}

export interface InputField {
  name: string;
  value: string;
}
