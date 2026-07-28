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

export type SepayPaymentResponse = {
  orderId: string;
  amount: number;
  currency: string;
  paymentCode: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrUrl: string;
  expiresAt: string;
};

type PaymentOrderStatus = {
  status: "paid" | "pending" | "failed" | "canceled";
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

export function getPaymentOrderStatus(orderId: string) {
  return supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single<PaymentOrderStatus>();
}

export async function getPaymentErrorMessage(error: unknown, fallback: string) {
  const context = (error as { context?: Response })?.context;

  if (context) {
    try {
      const body = (await context.clone().json()) as {
        error?: string | { message?: string };
        message?: string;
      };
      return typeof body.error === "string"
        ? body.error
        : body.error?.message ?? body.message ?? fallback;
    } catch {
      return fallback;
    }
  }

  return error instanceof Error ? error.message : fallback;
}
