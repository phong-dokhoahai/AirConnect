import { supabase } from "./supabase";

type VnpayCreateResponse = {
  paymentUrl: string;
  txnRef: string;
};

type VnpayVerifyResponse = {
  valid: boolean;
  success: boolean;
  responseCode?: string;
  txnRef?: string;
};

export function getVnpayReturnParams(url: string) {
  const query = url.includes("?") ? url.slice(url.indexOf("?") + 1) : url;
  const params = new URLSearchParams(query);

  return Object.fromEntries(params.entries());
}

export async function createVnpaySandboxPayment(input: {
  amount: number;
  currency: string;
  orderInfo: string;
  returnUrl: string;
}) {
  return supabase.functions.invoke<VnpayCreateResponse>("vnpay-payment", {
    body: {
      action: "create",
      ...input,
    },
  });
}

export async function verifyVnpayReturn(params: Record<string, string>) {
  return supabase.functions.invoke<VnpayVerifyResponse>("vnpay-payment", {
    body: {
      action: "verify",
      params,
    },
  });
}
