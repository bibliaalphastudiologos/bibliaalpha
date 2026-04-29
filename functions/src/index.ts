/**
 * Bíblia Alpha — Cloud Functions v2
 * Integração Mercado Pago + Firebase
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import * as crypto from "crypto";

// ─── Inicialização ───────────────────────────────────────────────
admin.initializeApp();

const FIRESTORE_DB = "ai-studio-d00d75cd-ea9b-4bf1-9db1-7ac14eff586f";
const db = admin.firestore(admin.app(), FIRESTORE_DB);

// ─── Helpers para ler env vars ───────────────────────────────────
const getMpAccessToken   = () => process.env.MP_ACCESS_TOKEN   || "";
const getMpWebhookSecret = () => process.env.MP_WEBHOOK_SECRET || "";

// ─── Constantes ──────────────────────────────────────────────────
const APP_BASE_URL     = "https://bibliaalpha.org";
const LANDING_BASE_URL = "https://studiologos.com.br";
const REGION           = "southamerica-east1";

// ─── Planos disponíveis ───────────────────────────────────────────
const PLANS: Record<string, { title: string; price: number; durationDays: number | null; lifetime: boolean }> = {
  anual: {
    title:        "Bíblia Alpha — Acesso Anual",
    price:        47.90,
    durationDays: 365,
    lifetime:     false,
  },
  vitalicio: {
    title:        "Bíblia Alpha — Acesso Vitalício",
    price:        97.00,
    durationDays: null,
    lifetime:     true,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateOrderId(): string {
  return "order_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
}

function corsHeaders(origin: string): Record<string, string> {
  const allowed = [APP_BASE_URL, LANDING_BASE_URL, "http://localhost:5173", "http://localhost:3000"];
  const o = allowed.includes(origin) ? origin : LANDING_BASE_URL;
  return {
    "Access-Control-Allow-Origin":  o,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age":       "86400",
  };
}

// ═══════════════════════════════════════════════════════════════════
// FUNÇÃO 1 — createMercadoPagoPreference
// ═══════════════════════════════════════════════════════════════════
export const createMercadoPagoPreference = onRequest(
  { region: REGION, cors: false, timeoutSeconds: 30 },
  async (req, res) => {
    const origin  = req.headers.origin || LANDING_BASE_URL;
    const headers = corsHeaders(origin);

    if (req.method === "OPTIONS") {
      Object.entries(headers).forEach(([k, v]) => res.set(k, v));
      res.status(204).send("");
      return;
    }

    Object.entries(headers).forEach(([k, v]) => res.set(k, v));

    if (req.method !== "POST") {
      res.status(405).json({ error: "Método não permitido" });
      return;
    }

    try {
      const { email, plan = "anual", product = "biblia_alpha" } = req.body as {
        email?: string; plan?: string; product?: string;
      };

      if (!email || typeof email !== "string") {
        res.status(400).json({ error: "Email é obrigatório" });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: "Email inválido" });
        return;
      }

      const normalizedEmail = normalizeEmail(email);
      const planConfig      = PLANS[plan];
      if (!planConfig) {
        res.status(400).json({ error: "Plano inválido. Use: anual ou vitalicio" });
        return;
      }

      // Verificar acesso ativo
      const accessRef  = db.collection("access").doc(normalizedEmail);
      const accessSnap = await accessRef.get();
      if (accessSnap.exists) {
        const d = accessSnap.data()!;
        if (
          d.active === true && d.status === "active" &&
          (d.lifetime === true || (d.expiresAt && d.expiresAt.toDate() > new Date()))
        ) {
          res.status(409).json({
            error:   "Este email já possui acesso ativo.",
            message: "Faça login em bibliaalpha.org com este email para acessar.",
          });
          return;
        }
      }

      const externalReference = generateOrderId();
      const now = admin.firestore.FieldValue.serverTimestamp();

      await db.collection("orders").doc(externalReference).set({
        email: normalizedEmail, status: "pending", product, plan,
        price: planConfig.price, currency: "BRL", provider: "mercado_pago",
        externalReference, createdAt: now, updatedAt: now,
      });

      const webhookUrl = `https://${REGION}-sentinela-ai-489015.cloudfunctions.net/mercadoPagoWebhook`;

      const mpResponse = await axios.post(
        "https://api.mercadopago.com/checkout/preferences",
        {
          items: [{ id: product, title: planConfig.title, quantity: 1, currency_id: "BRL", unit_price: planConfig.price }],
          payer: { email: normalizedEmail },
          external_reference: externalReference,
          notification_url: webhookUrl,
          back_urls: {
            success: `${APP_BASE_URL}/acesso-liberado`,
            failure: `${LANDING_BASE_URL}/pagamento-recusado`,
            pending: `${LANDING_BASE_URL}/pagamento-pendente`,
          },
          auto_return: "approved",
          statement_descriptor: "BIBLIAALPHA",
          metadata: { email: normalizedEmail, plan, product },
        },
        {
          headers: { Authorization: `Bearer ${getMpAccessToken()}`, "Content-Type": "application/json" },
          timeout: 15000,
        }
      );

      const { id: preferenceId, init_point, sandbox_init_point } = mpResponse.data;

      await db.collection("orders").doc(externalReference).update({ preferenceId, updatedAt: now });

      res.status(200).json({
        preferenceId,
        checkoutUrl:        init_point,
        sandboxCheckoutUrl: sandbox_init_point,
        externalReference,
      });
    } catch (err: any) {
      console.error("[createPreference] Erro:", err?.response?.data || err?.message);
      res.status(500).json({ error: "Erro interno ao criar preferência.", details: err?.response?.data?.message || err?.message });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
// FUNÇÃO 2 — mercadoPagoWebhook
// ═══════════════════════════════════════════════════════════════════
export const mercadoPagoWebhook = onRequest(
  { region: REGION, cors: false, timeoutSeconds: 30 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const secret = getMpWebhookSecret();
      if (secret) {
        const xSignature = req.headers["x-signature"] as string | undefined;
        const xRequestId = req.headers["x-request-id"] as string | undefined;
        const dataId     = req.query["data.id"] as string | undefined;

        if (xSignature) {
          const parts: Record<string, string> = {};
          xSignature.split(",").forEach((part) => {
            const [k, v] = part.split("=");
            if (k && v) parts[k.trim()] = v.trim();
          });
          const ts  = parts["ts"];
          const v1  = parts["v1"];
          const msg = `id:${dataId || ""};request-id:${xRequestId || ""};ts:${ts || ""};`;
          const expected = crypto.createHmac("sha256", secret).update(msg).digest("hex");
          if (v1 && v1 !== expected) {
            console.warn("[webhook] Assinatura inválida");
            res.status(200).send("OK");
            return;
          }
        }
      }

      const body = req.body as { type?: string; action?: string; data?: { id?: string }; id?: string | number };
      const type = body.type || body.action || "";
      const relevantTypes = ["payment", "payment.created", "payment.updated"];
      if (!relevantTypes.some((t) => type.includes(t)) && type !== "") {
        res.status(200).send("OK");
        return;
      }

      const paymentId = (body.data?.id || body.id)?.toString();
      if (!paymentId) { res.status(200).send("OK"); return; }

      let payment: any;
      try {
        const mpRes = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${getMpAccessToken()}` },
          timeout: 10000,
        });
        payment = mpRes.data;
      } catch (err: any) {
        console.error("[webhook] Erro ao consultar pagamento:", err?.response?.data || err?.message);
        res.status(200).send("OK");
        return;
      }

      const externalReference: string | null = payment.external_reference || null;
      if (!externalReference) { res.status(200).send("OK"); return; }

      const orderRef  = db.collection("orders").doc(externalReference);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) { res.status(200).send("OK"); return; }

      const orderData = orderSnap.data()!;
      const email     = orderData.email as string;
      const plan      = orderData.plan  as string;
      const product   = orderData.product as string;
      if (!email) { res.status(200).send("OK"); return; }

      const now = admin.firestore.FieldValue.serverTimestamp();

      switch (payment.status) {
        case "approved": {
          if (orderData.status === "approved") break;
          const planConfig = PLANS[plan] || PLANS["anual"];
          let expiresAt: admin.firestore.Timestamp | null = null;
          if (planConfig.durationDays) {
            const exp = new Date();
            exp.setDate(exp.getDate() + planConfig.durationDays);
            expiresAt = admin.firestore.Timestamp.fromDate(exp);
          }
          const batch = db.batch();
          batch.update(orderRef, { status: "approved", paymentId: paymentId.toString(), approvedAt: now, updatedAt: now });
          const accessRef = db.collection("access").doc(email);
          batch.set(accessRef, {
            email, active: true, status: "active", product, plan,
            paymentProvider: "mercado_pago", paymentId: paymentId.toString(),
            externalReference, approvedAt: now, expiresAt, lifetime: planConfig.lifetime, updatedAt: now,
          }, { merge: true });
          const aSnap = await accessRef.get();
          if (!aSnap.exists) batch.set(accessRef, { createdAt: now }, { merge: true });
          await batch.commit();
          console.log(`[webhook] ✅ Acesso LIBERADO para ${email} — plano ${plan}`);
          break;
        }
        case "pending":
        case "in_process":
          await orderRef.update({ status: "pending", paymentId: paymentId.toString(), updatedAt: now });
          break;
        case "rejected":
        case "cancelled":
          await orderRef.update({ status: payment.status, paymentId: paymentId.toString(), updatedAt: now });
          break;
        case "refunded":
        case "charged_back": {
          const batch = db.batch();
          const aRef  = db.collection("access").doc(email);
          const aSnap = await aRef.get();
          if (aSnap.exists) batch.update(aRef, { active: false, status: payment.status === "refunded" ? "refunded" : "chargeback", updatedAt: now });
          batch.update(orderRef, { status: payment.status, updatedAt: now });
          await batch.commit();
          console.log(`[webhook] ⚠️ Acesso REVOGADO para ${email}`);
          break;
        }
      }

      res.status(200).send("OK");
    } catch (err: any) {
      console.error("[webhook] Erro:", err?.message);
      res.status(200).send("OK");
    }
  }
);
