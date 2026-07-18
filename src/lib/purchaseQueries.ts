import { supabase } from "./supabase";
import type { PlanDisplayRow } from "./planDisplay";

export type PurchaseTraveler = {
  fullName: string;
  email: string;
  paymentMethod?: string;
  discountAmount?: number;
  taxAmount?: number;
};

type PurchaseRpcRow = {
  order_id: string;
  user_esim_id: string;
};

const planSelect = `
  id,
  title,
  data_amount_gb,
  is_unlimited,
  validity_days,
  price,
  currency,
  supports_5g,
  plan_countries (
    countries (
      name,
      iso2
    )
  ),
  plan_regions (
    regions (
      name,
      slug
    )
  )
`;

export async function createDemoPurchase(
  userId: string,
  plan: PlanDisplayRow,
  traveler: PurchaseTraveler,
) {
  if (!userId) {
    return { data: null, error: new Error("Authentication required") };
  }

  const purchaseResult = await supabase
    .rpc("create_demo_purchase", {
      p_plan_id: plan.id,
      p_traveler_full_name: traveler.fullName,
      p_traveler_email: traveler.email,
      p_payment_method: traveler.paymentMethod ?? "demo",
      p_discount_amount: traveler.discountAmount ?? 0,
      p_tax_amount: traveler.taxAmount ?? 0,
    })
    .single();

  if (purchaseResult.error || !purchaseResult.data) {
    return { data: null, error: purchaseResult.error };
  }

  const purchase = purchaseResult.data as PurchaseRpcRow;

  return {
    data: {
      orderId: purchase.order_id,
      userEsimId: purchase.user_esim_id,
    },
    error: null,
  };
}

export function getUserEsims(userId: string) {
  return supabase
    .from("user_esims")
    .select(
      `
      id,
      order_id,
      plan_id,
      status,
      data_used_gb,
      activated_at,
      expires_at,
      created_at,
      esim_plans (
        ${planSelect}
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export function getOrderWithEsim(orderId: string) {
  return supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      plan_id,
      status,
      traveler_email,
      total_amount,
      currency,
      created_at,
      esim_plans (
        ${planSelect}
      ),
      user_esims (
        id,
        status,
        expires_at,
        data_used_gb
      )
    `,
    )
    .eq("id", orderId)
    .single();
}
