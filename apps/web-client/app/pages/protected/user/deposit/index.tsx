import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Separator } from "@repo/ui/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useLocale } from "remix-i18next/react";
import PaymentMethodModal from "~/components/payment-method-modal";
import { useFormMutation } from "~/hooks/use-form-mutation";
import { apiClient } from "~/utils/axios";
import { formatPrice } from "~/utils/format";

const calculateFee = (paymentMethod: DepositPaymentMethod, amount: number) => {
  const percentageFee = (amount * paymentMethod.fee_percentage) / 100;
  return paymentMethod.fee_static + percentageFee;
};

interface DepositFormData {
  payment_method_id: string;
  amount: number;
  phone_number?: string;
}

export default function UserDeposit() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<DepositPaymentMethod | null>(null);
  const navigate = useNavigate();
  const locale = useLocale();

  const form = useForm<DepositFormData>({
    defaultValues: {
      payment_method_id: "",
      amount: 0,
      phone_number: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = form;

  const watchedAmount = watch("amount");
  const watchedPhoneNumber = watch("phone_number");

  const paymentMethods = useQuery({
    queryKey: ["depositPaymentMethods"],
    queryFn: async () =>
      apiClient
        .get<DepositPaymentMethodsResponse>("/deposit/payment-methods")
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data;
        }),
  });

  const createDeposit = useFormMutation({
    form,
    mutationKey: ["createDeposit"],
    mutationFn: async (data: DepositFormData) =>
      apiClient
        .post("/deposit/create", data)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data;
        }),
    onSuccess(data) {
      toast.success(data.message || "Deposit created successfully");
      navigate(`/${locale}/user/deposit/history/${data.data.deposit_id}`);
    },
  });

  // Update form when payment method changes
  useEffect(() => {
    if (selectedPaymentMethod) {
      setValue("payment_method_id", selectedPaymentMethod.id);
      // Reset phone number if not needed
      if (!selectedPaymentMethod.is_need_phone_number) {
        setValue("phone_number", "");
      }
      // Trigger validation for amount when payment method changes
      trigger("amount");
    }
  }, [selectedPaymentMethod, setValue, trigger]);

  const calculateTotal = useMemo(() => {
    const parsedAmount = Number(watchedAmount) || 0;
    const fee = selectedPaymentMethod
      ? calculateFee(selectedPaymentMethod, parsedAmount)
      : 0;
    const total = Math.ceil(parsedAmount + fee);

    return {
      parsedAmount,
      fee,
      totalAmount: total,
    };
  }, [selectedPaymentMethod, watchedAmount]);

  // Validation function for amount
  const validateAmount = (value: number) => {
    if (!selectedPaymentMethod) return true;

    if (!value || value <= 0) {
      return "Amount is required";
    }

    if (value < selectedPaymentMethod.min_amount) {
      return `Minimum amount is ${formatPrice(selectedPaymentMethod.min_amount)}`;
    }

    if (value > selectedPaymentMethod.max_amount) {
      return `Maximum amount is ${formatPrice(selectedPaymentMethod.max_amount)}`;
    }

    return true;
  };

  // Validation function for phone number
  const validatePhoneNumber = (value: string | undefined) => {
    if (!selectedPaymentMethod?.is_need_phone_number) return true;

    if (!value || value.trim() === "") {
      return "Phone number is required for this payment method";
    }

    // Basic phone number validation (Indonesian format)
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ""))) {
      return "Please enter a valid Indonesian phone number";
    }

    return true;
  };

  if (paymentMethods.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (paymentMethods.isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">Error loading payment methods</p>
      </div>
    );
  }

  const onSubmit = (data: DepositFormData) => {
    if (selectedPaymentMethod?.is_need_phone_number) {
      createDeposit.mutate({
        amount: +data.amount,
        payment_method_id: data.payment_method_id,
        phone_number: data.phone_number,
      });
    } else {
      createDeposit.mutate({
        amount: +data.amount,
        payment_method_id: data.payment_method_id,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl lg:border border-border lg:p-6 bg-card"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Deposit
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Top up your account balance
        </p>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Payment Method</Label>
        <PaymentMethodModal
          paymentData={paymentMethods.data?.data || []}
          selectedPaymentMethod={selectedPaymentMethod}
          onSelectPaymentMethod={setSelectedPaymentMethod}
          formatPrice={formatPrice}
        />
      </div>

      {/* Amount Input */}
      <div className="space-y-3">
        <Label htmlFor="amount" className="text-sm font-medium">
          Amount (IDR)
        </Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount"
          {...register("amount", {
            required: "Amount is required",
            min: {
              value: selectedPaymentMethod?.min_amount || 1,
              message: selectedPaymentMethod
                ? `Minimum amount is ${formatPrice(selectedPaymentMethod.min_amount)}`
                : "Amount must be greater than 0",
            },
            max: {
              value: selectedPaymentMethod?.max_amount || 999999999,
              message: selectedPaymentMethod
                ? `Maximum amount is ${formatPrice(selectedPaymentMethod.max_amount)}`
                : "Amount is too large",
            },
            validate: validateAmount,
          })}
          className={`h-12 text-lg ${errors.amount ? "border-red-500 focus:border-red-500" : ""}`}
        />

        {/* Show min/max info when payment method is selected */}
        {selectedPaymentMethod && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Min: {formatPrice(selectedPaymentMethod.min_amount)} - Max:{" "}
            {formatPrice(selectedPaymentMethod.max_amount)}
          </p>
        )}

        {/* Show validation error */}
        {errors.amount && (
          <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
        )}
      </div>

      {/* Phone Number Input - Conditional */}
      {selectedPaymentMethod?.is_need_phone_number && (
        <div className="space-y-3">
          <Label htmlFor="phone_number" className="text-sm font-medium">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone_number"
            type="tel"
            placeholder="Enter your phone number (e.g., 08123456789)"
            {...register("phone_number", {
              validate: validatePhoneNumber,
            })}
            className={`h-12 ${errors.phone_number ? "border-red-500 focus:border-red-500" : ""}`}
          />

          {/* Show validation error */}
          {errors.phone_number && (
            <p className="text-xs text-red-500 mt-1">
              {errors.phone_number.message}
            </p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Required for this payment method
          </p>
        </div>
      )}

      {/* Quick Amount Buttons */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quick Select</Label>
        <div className="flex flex-wrap gap-3">
          {[50000, 100000, 250000, 500000].map((quickAmount) => (
            <Button
              key={quickAmount}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setValue("amount", quickAmount);
                trigger("amount"); // Trigger validation
              }}
              disabled={
                !!selectedPaymentMethod &&
                (quickAmount < selectedPaymentMethod.min_amount ||
                  quickAmount > selectedPaymentMethod.max_amount)
              }
              className="text-sm border-border"
            >
              {formatPrice(quickAmount)}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {selectedPaymentMethod && watchedAmount && watchedAmount > 0 && (
        <div className="rounded-xl border border-gray-200 p-6 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Payment Summary
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Deposit Amount
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatPrice(calculateTotal.parsedAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Administrative Fee
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatPrice(calculateTotal.fee)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span className="text-gray-900 dark:text-white">
                Total Payment
              </span>
              <span className="text-primary text-lg">
                {formatPrice(calculateTotal.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Proceed Button */}
      <Button
        size="lg"
        className="w-full"
        disabled={
          !selectedPaymentMethod ||
          !watchedAmount ||
          watchedAmount <= 0 ||
          !isValid ||
          (selectedPaymentMethod?.is_need_phone_number &&
            !watchedPhoneNumber) ||
          createDeposit.isPending
        }
      >
        {createDeposit.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <Zap className="w-5 h-5 mr-2" />
        )}
        Proceed with Deposit
      </Button>
    </form>
  );
}

export interface DepositPaymentMethodsResponse {
  success: boolean;
  message: string;
  data: DepositPaymentData[];
}

export interface DepositPaymentData {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  payment_methods: DepositPaymentMethod[];
}

export interface DepositPaymentMethod {
  id: string;
  name: string;
  fee_type: string;
  type: string;
  fee_static: number;
  fee_percentage: number;
  image_url: string;
  is_need_email: boolean;
  is_need_phone_number: boolean;
  is_available: boolean;
  is_featured: boolean;
  label: any;
  min_amount: number;
  max_amount: number;
  cut_off_start: string;
  cut_off_end: string;
}
