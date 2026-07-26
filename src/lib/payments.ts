import { supabase } from "./supabase";

export type PaymentMetadata = {
  productType: "esim";
  esimId: string;
  planId: string;
  country: string;
  days: number;
  gb: number;
};

type PaymentInput = {
  planId: string;
  travelerFullName: string;
  travelerEmail: string;
  discountAmount: number;
  taxAmount: number;
  metadata: PaymentMetadata;
};

type StripePaymentInput = PaymentInput & {
  successUrl: string;
  cancelUrl: string;
};

type StripePaymentResponse = {
  orderId: string;
  checkoutUrl: string;
};

type SepayPaymentResponse = {
  orderId: string;
  amount: number;
  currency: string;
  paymentCode: string;
};

export function createStripeCheckoutPayment(input: StripePaymentInput) {
  return supabase.functions.invoke<StripePaymentResponse>("stripe-payment", {
    body: {
      action: "create",
      ...input,
    },
  });
}

export function createSepayPendingPayment(input: PaymentInput) {
  return supabase.functions.invoke<SepayPaymentResponse>("sepay-payment", {
    body: {
      action: "create",
      ...input,
    },
  });
}
