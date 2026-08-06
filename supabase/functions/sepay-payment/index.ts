type CreateBody = {
  action: "create";
  planId: string;
  travelerFullName: string;
  travelerEmail: string;
  discountAmount?: number;
  taxAmount?: number;
  metadata?: Record<string, unknown>;
};

type SepayWebhookBody = {
  id?: number;
  code?: string | null;
  transferType?: string;
  transferAmount?: number;
  referenceCode?: string;
};

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

function env(name: string) {
  return Deno.env.get(name)?.trim() ?? "";
}

function requireSupabaseConfig() {
  if (!env("SUPABASE_URL") || !env("SUPABASE_ANON_KEY")) {
    return "Missing Supabase function configuration";
  }
  return "";
}

function sepayBankConfig() {
  return {
    bankCode: env("SEPAY_BANK_CODE") || "TCB",
    accountNumber: (env("SEPAY_ACCOUNT_NUMBER") || "19070208496017").replaceAll(" ", ""),
    accountHolder: env("SEPAY_ACCOUNT_HOLDER") || "DO KHOA HAI PHONG",
  };
}

function buildQrUrl(paymentCode: string, amount: number) {
  const bank = sepayBankConfig();
  const params = new URLSearchParams({
    acc: bank.accountNumber,
    bank: bank.bankCode,
    amount: String(Math.round(amount)),
    des: paymentCode,
    template: "compact",
    showinfo: "true",
    holder: bank.accountHolder,
  });

  return `https://vietqr.app/img?${params.toString()}`;
}

function safeEqual(first: string, second: string) {
  if (first.length !== second.length) return false;
  let diff = 0;
  for (let index = 0; index < first.length; index += 1) {
    diff |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }
  return diff === 0;
}

async function supabaseRpc<T>(name: string, body: unknown, authorization: string) {
  const response = await fetch(`${env("SUPABASE_URL")}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: env("SUPABASE_ANON_KEY"),
      authorization,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as T;
  return response.ok ? { data, error: null } : { data: null, error: data };
}

async function serviceRpc<T>(name: string, body: unknown) {
  const response = await fetch(`${env("SUPABASE_URL")}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: env("SUPABASE_SERVICE_ROLE_KEY"),
      authorization: `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as T;
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function markPaid(paymentCode: string) {
  const response = await fetch(
    `${env("SUPABASE_URL")}/rest/v1/orders?payment_provider=eq.sepay&provider_payment_id=eq.${paymentCode}`,
    {
      method: "PATCH",
      headers: {
        apikey: env("SUPABASE_SERVICE_ROLE_KEY"),
        authorization: `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`,
        "content-type": "application/json",
        prefer: "return=representation",
      },
      body: JSON.stringify({
        status: "paid",
        provider_payment_id: paymentCode,
        paid_at: new Date().toISOString(),
      }),
    },
  );

  const rows = (await response.json()) as { id?: string }[];
  if (!response.ok) throw new Error(JSON.stringify(rows));
  return rows[0]?.id;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const rawBody = await request.text();
  const authorization = request.headers.get("authorization") ?? "";
  const expected = `Apikey ${env("SEPAY_API_KEY")}`;

  if (authorization.startsWith("Apikey ")) {
    if (!env("SEPAY_API_KEY") || !safeEqual(authorization, expected)) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const body = JSON.parse(rawBody) as SepayWebhookBody;

    if (body.code && body.transferType === "in" && Number(body.transferAmount) > 0) {
      const orderId = await markPaid(body.code);
      if (orderId) {
        await serviceRpc("fulfill_paid_payment_order", { p_order_id: orderId });
      }
    }

    return json({ success: true });
  }

  const body = JSON.parse(rawBody) as CreateBody;
  if (body.action !== "create") return json({ error: "Invalid action" }, 400);

  const configError = requireSupabaseConfig();
  if (configError) return json({ error: configError }, 500);

  const order = await supabaseRpc<
    { order_id: string; total_amount: number; currency: string; payment_code: string }[]
  >(
    "create_pending_payment_order",
    {
      p_plan_id: body.planId,
      p_traveler_full_name: body.travelerFullName,
      p_traveler_email: body.travelerEmail,
      p_payment_provider: "sepay",
      p_discount_amount: body.discountAmount ?? 0,
      p_tax_amount: body.taxAmount ?? 0,
      p_payment_metadata: body.metadata ?? {},
    },
    authorization,
  );

  const row = order.data?.[0];
  if (order.error || !row) return json({ error: order.error ?? "Unable to create order" }, 400);

  const bank = sepayBankConfig();

  return json({
    orderId: row.order_id,
    amount: row.total_amount,
    currency: row.currency,
    paymentCode: row.payment_code,
    bankCode: bank.bankCode,
    bankName: bank.bankCode,
    accountNumber: bank.accountNumber,
    accountHolder: bank.accountHolder,
    qrUrl: buildQrUrl(row.payment_code, row.total_amount),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });
});
