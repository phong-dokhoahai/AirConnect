type CreatePaymentBody = {
  action: "create";
  amount: number;
  currency: string;
  orderInfo: string;
  returnUrl?: string;
};

type VerifyReturnBody = {
  action: "verify";
  params: Record<string, string>;
};

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const sandboxPayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const encoder = new TextEncoder();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function env(name: string) {
  return Deno.env.get(name)?.trim() ?? "";
}

function formatVnpDate(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");
  const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  return `${gmt7.getUTCFullYear()}${pad(gmt7.getUTCMonth() + 1)}${pad(gmt7.getUTCDate())}${pad(gmt7.getUTCHours())}${pad(gmt7.getUTCMinutes())}${pad(gmt7.getUTCSeconds())}`;
}

function sortedSearch(params: Record<string, string>) {
  const search = new URLSearchParams();

  Object.keys(params)
    .sort()
    .forEach((key) => {
      const value = params[key];
      if (value) search.append(key, value);
    });

  return search;
}

async function hmacSha512(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
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

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const tmnCode = env("VNPAY_TMN_CODE");
  const hashSecret = env("VNPAY_HASH_SECRET");

  if (!tmnCode || !hashSecret) {
    return json({ error: "Missing VNPay sandbox configuration" }, 500);
  }

  const body = (await request.json()) as CreatePaymentBody | VerifyReturnBody;

  if (body.action === "create") {
    const rate = Number(env("VNPAY_USD_TO_VND") || "25000");
    const amountVnd =
      body.currency.toUpperCase() === "VND"
        ? body.amount
        : body.amount * rate;
    const txnRef = `${Date.now()}${crypto.randomUUID().slice(0, 8)}`;
    const ipAddr =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";
    const params = sortedSearch({
      vnp_Amount: String(Math.round(amountVnd) * 100),
      vnp_Command: "pay",
      vnp_CreateDate: formatVnpDate(new Date()),
      vnp_CurrCode: "VND",
      vnp_ExpireDate: formatVnpDate(new Date(Date.now() + 15 * 60 * 1000)),
      vnp_IpAddr: ipAddr,
      vnp_Locale: "vn",
      vnp_OrderInfo: body.orderInfo,
      vnp_OrderType: "other",
      vnp_ReturnUrl: body.returnUrl || env("VNPAY_RETURN_URL"),
      vnp_TmnCode: tmnCode,
      vnp_TxnRef: txnRef,
      vnp_Version: "2.1.0",
    });
    const secureHash = await hmacSha512(hashSecret, params.toString());
    params.append("vnp_SecureHash", secureHash);

    return json({
      paymentUrl: `${env("VNPAY_PAY_URL") || sandboxPayUrl}?${params.toString()}`,
      txnRef,
    });
  }

  if (body.action === "verify") {
    const { vnp_SecureHash, vnp_SecureHashType: _type, ...params } = body.params;

    if (!vnp_SecureHash) {
      return json({ valid: false, success: false });
    }

    const signed = await hmacSha512(hashSecret, sortedSearch(params).toString());
    const responseCode = params.vnp_ResponseCode;
    const transactionStatus = params.vnp_TransactionStatus;

    return json({
      valid: safeEqual(signed, vnp_SecureHash.toLowerCase()),
      success:
        safeEqual(signed, vnp_SecureHash.toLowerCase()) &&
        responseCode === "00" &&
        (!transactionStatus || transactionStatus === "00"),
      responseCode,
      txnRef: params.vnp_TxnRef,
    });
  }

  return json({ error: "Invalid action" }, 400);
});
