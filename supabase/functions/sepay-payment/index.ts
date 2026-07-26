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

async function markPaid(paymentCode: string) {
  await fetch(
    `${env("SUPABASE_URL")}/rest/v1/orders?payment_provider=eq.sepay&provider_payment_id=eq.${paymentCode}`,
    {
      method: "PATCH",
      headers: {
        apikey: env("SUPABASE_SERVICE_ROLE_KEY"),
        authorization: `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`,
        "content-type": "application/json",
        prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "paid",
        provider_payment_id: paymentCode,
        paid_at: new Date().toISOString(),
      }),
    },
  );
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
      await markPaid(body.code);
    }

    return json({ success: true });
  }

  const body = JSON.parse(rawBody) as CreateBody;
  if (body.action !== "create") return json({ error: "Invalid action" }, 400);

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

  return json({
    orderId: row.order_id,
    amount: row.total_amount,
    currency: row.currency,
    paymentCode: row.payment_code,
  });
});
