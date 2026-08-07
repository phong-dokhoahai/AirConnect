type CreateBody = {
  action: "create";
  planId: string;
  travelerFullName: string;
  travelerEmail: string;
  discountAmount?: number;
  taxAmount?: number;
  metadata?: Record<string, unknown>;
  successUrl: string;
  cancelUrl: string;
};

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const encoder = new TextEncoder();
const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
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

function form(input: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => params.append(key, value));
  return params;
}

async function hmacSha256(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

async function updateOrder(orderId: string, status: string, providerPaymentId?: string) {
  await fetch(`${env("SUPABASE_URL")}/rest/v1/orders?id=eq.${orderId}`, {
    method: "PATCH",
    headers: {
      apikey: env("SUPABASE_SERVICE_ROLE_KEY"),
      authorization: `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify({
      status,
      provider_payment_id: providerPaymentId,
      paid_at: status === "paid" ? new Date().toISOString() : null,
    }),
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const stripeSecret = env("STRIPE_SECRET_KEY");

  if (!stripeSecret) return json({ error: "Missing Stripe configuration" }, 500);

  const rawBody = await request.text();

  if (request.method === "POST" && request.headers.get("stripe-signature")) {
    const webhookSecret = env("STRIPE_WEBHOOK_SECRET");
    const signature = request.headers.get("stripe-signature") ?? "";
    const timestamp = signature.match(/t=([^,]+)/)?.[1] ?? "";
    const received = signature.match(/v1=([^,]+)/)?.[1] ?? "";
    const expected = await hmacSha256(webhookSecret, `${timestamp}.${rawBody}`);
    const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));

    if (!webhookSecret || !received || ageSeconds > 300 || !safeEqual(expected, received)) {
      return json({ error: "Invalid signature" }, 401);
    }

    const event = JSON.parse(rawBody) as {
      type: string;
      data?: { object?: { id?: string; metadata?: { orderId?: string } } };
    };
    const object = event.data?.object;
    const orderId = object?.metadata?.orderId;

    if (
      event.type === "checkout.session.completed" ||
      event.type === "payment_intent.succeeded" ||
      event.type === "charge.succeeded"
    ) {
      if (!orderId) return json({ error: `Missing orderId metadata for ${event.type}` }, 400);
      await updateOrder(orderId, "paid", object?.id);
      await serviceRpc("fulfill_paid_payment_order", { p_order_id: orderId });
    }

    if (event.type === "checkout.session.expired") {
      if (!orderId) return json({ error: `Missing orderId metadata for ${event.type}` }, 400);
      await updateOrder(orderId, "canceled", object?.id);
      return json({ received: true });
    }

    return json({ received: true, ignored: event.type });
  }

  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

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
      p_payment_provider: "stripe",
      p_discount_amount: body.discountAmount ?? 0,
      p_tax_amount: body.taxAmount ?? 0,
      p_payment_metadata: body.metadata ?? {},
    },
    request.headers.get("authorization") ?? "",
  );

  const row = order.data?.[0];
  if (order.error || !row) return json({ error: order.error ?? "Unable to create order" }, 400);

  const session = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${stripeSecret}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form({
      mode: "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": row.currency.toLowerCase(),
      "line_items[0][price_data][unit_amount]": String(Math.round(Number(row.total_amount) * 100)),
      "line_items[0][price_data][product_data][name]": "AirConnect eSIM",
      customer_email: body.travelerEmail,
      success_url: `${body.successUrl}?orderId=${row.order_id}`,
      cancel_url: `${body.cancelUrl}?orderId=${row.order_id}`,
      "metadata[orderId]": row.order_id,
      "metadata[paymentCode]": row.payment_code,
      "payment_intent_data[metadata][orderId]": row.order_id,
      "payment_intent_data[metadata][paymentCode]": row.payment_code,
    }),
  });
  const sessionData = (await session.json()) as { id?: string; url?: string; error?: { message?: string } };

  if (!session.ok || !sessionData.url) {
    return json({ error: sessionData.error?.message ?? "Unable to create Stripe session" }, 400);
  }

  await updateOrder(row.order_id, "pending", sessionData.id);

  return json({ orderId: row.order_id, checkoutUrl: sessionData.url });
});
