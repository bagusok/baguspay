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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import {
  Building2,
  ChevronDown,
  CreditCard,
  Smartphone,
  Store,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import type {
  DepositPaymentData,
  DepositPaymentMethod,
} from "~/pages/protected/user/deposit";

interface PaymentMethodModalProps {
  paymentData: DepositPaymentData[];
  selectedPaymentMethod: DepositPaymentMethod | null;
  onSelectPaymentMethod: (method: DepositPaymentMethod) => void;
  formatPrice: (amount: number) => string;
}

const getPaymentMethodIcon = (type: string) => {
  switch (type) {
    case "qr_code":
      return <Smartphone className="w-5 h-5" />;
    case "virtual_account":
      return <Building2 className="w-5 h-5" />;
    case "e_wallet":
      return <Wallet className="w-5 h-5" />;
    case "retail":
      return <Store className="w-5 h-5" />;
    default:
      return <CreditCard className="w-5 h-5" />;
  }
};

export default function PaymentMethodModal({
  paymentData,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  formatPrice,
}: PaymentMethodModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectMethod = (method: DepositPaymentMethod) => {
    onSelectPaymentMethod(method);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-16 justify-between bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          {selectedPaymentMethod ? (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {selectedPaymentMethod.image_url ? (
                  <img
                    src={selectedPaymentMethod.image_url}
                    alt={selectedPaymentMethod.name}
                    className="w-8 h-8 object-contain rounded"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    {getPaymentMethodIcon(selectedPaymentMethod.type)}
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedPaymentMethod.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Fee: {formatPrice(selectedPaymentMethod.fee_static)}
                  {selectedPaymentMethod.fee_percentage > 0 &&
                    ` + ${selectedPaymentMethod.fee_percentage}%`}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-600 dark:text-gray-400">
                  Select Payment Method
                </p>
                <p className="text-xs text-gray-400">
                  Choose how you want to pay
                </p>
              </div>
            </div>
          )}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Payment Method</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method for the deposit
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2">
          <Accordion type="multiple" className="w-full space-y-2">
            {paymentData
              .filter((category) => category.payment_methods.length > 0)
              .map((category) => (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getPaymentMethodIcon(
                          category.payment_methods[0]?.type || "default",
                        )}
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {
                            category.payment_methods.filter(
                              (m) => m.is_available,
                            ).length
                          }{" "}
                          methods available
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="grid gap-3 pt-2">
                      {category.payment_methods
                        .filter((method) => method.is_available)
                        .map((method) => (
                          <button
                            key={method.id}
                            className={`cursor-pointer transition-all duration-200 rounded-lg border p-4 hover:shadow-md text-left w-full ${
                              selectedPaymentMethod?.id === method.id
                                ? "ring-2 ring-primary border-primary bg-primary/5"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                            }`}
                            onClick={() => handleSelectMethod(method)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                {method.image_url ? (
                                  <img
                                    src={method.image_url}
                                    alt={method.name}
                                    className="w-12 h-12 object-contain rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                                    {getPaymentMethodIcon(method.type)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {method.name}
                                  </p>
                                  {method.is_featured && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Fee: {formatPrice(method.fee_static)}
                                  {method.fee_percentage > 0 &&
                                    ` + ${method.fee_percentage}%`}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  Min: {formatPrice(method.min_amount)} - Max:{" "}
                                  {formatPrice(method.max_amount)}
                                </div>
                              </div>
                              {selectedPaymentMethod?.id === method.id && (
                                <div className="text-primary">
                                  <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
