import { PaymentMethodType } from "@repo/db/types";
import {
  BuildingIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  QrCodeIcon,
  WalletIcon,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import BalancePayment from "./payment-types/balance-payment";
import BankTransferPayment from "./payment-types/bank-transfer-payment";
import DefaultPayment from "./payment-types/default-payment";
import EwalletPayment from "./payment-types/ewallet-payment";
import LinkPayment from "./payment-types/link-payment";
import PaymentLoading from "./payment-types/payment-loading";
import PaymentSuccess from "./payment-types/payment-success";
import PaymentUnavailable from "./payment-types/payment-unavailable";
import QrCodePayment from "./payment-types/qr-code-payment";
import RetailPayment from "./payment-types/retail-payment";

type Props = {
  paymentMethod: {
    name: string;
    type: PaymentMethodType;
    qr_code?: string;
    pay_url?: string;
    pay_code?: string;
  };
  paymentStatus: string;
  orderStatus: string;
};

export default function PaymentMethodDisplay({
  paymentMethod,
  paymentStatus,
  orderStatus,
}: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      toast.success(`${fieldName} disalin ke clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const getPaymentMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case "bank_transfer":
      case "virtual_account":
        return <BuildingIcon className="w-5 h-5" />;
      case "qr_code":
        return <QrCodeIcon className="w-5 h-5" />;
      case "e_wallet":
        return <WalletIcon className="w-5 h-5" />;
      case "balance":
        return <WalletIcon className="w-5 h-5" />;
      case "link_payment":
        return <ExternalLinkIcon className="w-5 h-5" />;
      default:
        return <CreditCardIcon className="w-5 h-5" />;
    }
  };

  const renderPaymentContent = () => {
    // Don't show payment details if already paid/completed
    if (paymentStatus === "success" || paymentStatus === "paid") {
      return <PaymentSuccess paymentName={paymentMethod.name} />;
    }

    // Don't show payment details if expired/failed/cancelled
    if (["expired", "failed", "cancelled"].includes(paymentStatus)) {
      return (
        <PaymentUnavailable
          paymentName={paymentMethod.name}
          status={paymentStatus}
        />
      );
    }

    // Show payment details for pending payments
    switch (paymentMethod.type) {
      case PaymentMethodType.QR_CODE:
        if (paymentMethod.qr_code && paymentMethod.qr_code !== "SANDBOX MODE") {
          return (
            <QrCodePayment
              qrCode={paymentMethod.qr_code}
              paymentName={paymentMethod.name}
            />
          );
        }
        break;
      case PaymentMethodType.BANK_TRANSFER:
      case PaymentMethodType.VIRTUAL_ACCOUNT:
        if (paymentMethod.pay_code) {
          return (
            <BankTransferPayment
              payCode={paymentMethod.pay_code}
              paymentType={paymentMethod.type}
              onCopy={copyToClipboard}
            />
          );
        }
        break;

      case PaymentMethodType.LINK_PAYMENT:
        if (paymentMethod.pay_url) {
          return (
            <LinkPayment
              payUrl={paymentMethod.pay_url}
              paymentName={paymentMethod.name}
            />
          );
        }
        break;

      case PaymentMethodType.E_WALLET:
        return <EwalletPayment paymentName={paymentMethod.name} />;

      case PaymentMethodType.RETAIL:
        if (paymentMethod.pay_code) {
          return (
            <RetailPayment
              payCode={paymentMethod.pay_code}
              paymentName={paymentMethod.name}
              onCopy={copyToClipboard}
            />
          );
        }
        break;

      case PaymentMethodType.BALANCE:
        return <BalancePayment paymentName={paymentMethod.name} />;

      default:
        return (
          <DefaultPayment
            paymentName={paymentMethod.name}
            paymentType={paymentMethod.type}
          />
        );
    }

    // Fallback for pending payments without specific details
    return <PaymentLoading paymentName={paymentMethod.name} />;
  };

  return (
    <div className="space-y-4">
      {/* Payment Method Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {getPaymentMethodIcon(paymentMethod.type)}
        </div>
        <div>
          <p className="font-medium">{paymentMethod.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {paymentMethod.type.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      {/* Payment Content */}
      {renderPaymentContent()}
    </div>
  );
}
