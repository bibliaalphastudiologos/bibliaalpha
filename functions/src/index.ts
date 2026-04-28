/**
 * Bíblia Alpha — Cloud Functions v2
 * Integração Mercado Pago + Firebase
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import axios from "axios";
import * as crypto from "crypto";

// ─── Inicialização ───────────────────────────────────────────────
admin.initializeApp();

const FIRESTORE_DB = "ai-studio-d00d75cd-ea9b-4bf1-9db1-7ac14eff586f";
const db = admin.firestore(admin.app(), FIRESTORE_DB);

// ─── Secrets (firebase functions:secrets:set) ────────────────────
const MP_ACCESS_TOKEN   = defineSecret("MP_ACCESS_TOKEN");
const MP_WEBHOOK_SECRET = defineSecret("MP_WEBHOOK_SECRET");

// ─── Constantes ──────────────────────────────────────────────────
const APP_BASE_URL      = "https://bibliaalpha.org";
const LANDING_BASE_URL  = "https://studiologos.com.br";
const REGION            = "southamerica-east1";

// ─── Planos disponíveis ───────────────────────────────────────────
const PLANS: Record<string, { title: string; price: number; durationDays: number | null; lifetime: boolean }> = {
  anual: {
    title:       "Bíblia Alpha — Acesso Anual",
    price:       47.90,
    durationDays: 365,
    lifetime:    false,
  },
  vitalicio: {
    title:       "Bíblia Alpha — Acesso Vitalício",
    price:       97.00,
    durationDays: null,
    lifetime:    true,
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
// Chamada pelo frontend da landing page para iniciar o checkout
// ═══════════════════════════════════════════════════════════════════
export const createMercadoPagoPreference = onRequest(
  {
    region:  REGION,
    secrets: [MP_ACCESS_TOKEN],
    cors:    false,
    timeoutSeconds: 30,
  },
  async (req, res) => {
    const origin = req.headers.origin || LANDING_BASE_URL;
    const headers = corsHeaders(origin);

    // Preflight
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
        email?: string;
        plan?: string;
        product?: string;
      };

      // Validações
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
      const planConfig = PLANS[plan];
      if (!planConfig) {
        res.status(400).json({ error: "Plano inválido. Use: anual ou vitalicio" });
        return;
      }

      // Verificar se já tem acesso ativo (evita compra duplicada)
      const accessRef = db.collection("access").doc(normalizedEmail);
      const accessSnap = await accessRef.get();
      if (accessSnap.exists) {
        const accessData = accessSnap.data()!;
        if (
          accessData.active === true &&
          accessData.status === "active" &&
          (accessData.lifetime === true || (accessData.expiresAt && accessData.expiresAt.toDate() > new Date()))
        ) {
          res.status(409).json({
            error:   "Este email já possui acesso ativo.",
            message: "Faça login em bibliaalpha.org com este email para acessar.",
          });
          return;
        }
      }

      // Criar order pendente no Firestore
      const externalReference = generateOrderId();
      const now = admin.firestore.FieldValue.serverTimestamp();

      await db.collection("orders").doc(externalReference).set({
        email:             normalizedEmail,
        status:            "pending",
        product,
        plan,
        price:             planConfig.price,
        currency:          "BRL",
        provider:          "mercado_pago",
        externalReference,
        createdAt:         now,
        updatedAt:         now,
      });

      console.log(`[createPreference] Order criada: ${externalReference} para ${normalizedEmail}`);

      // Criar preferência no Mercado Pago
      const webhookUrl = `https://${REGION}-sentinela-ai-489015.cloudfunctions.net/mercadoPagoWebhook`;

      const preferenceData = {
        items: [
          {
            id:          product,
            title:       planConfig.title,
            quantity:    1,
            currency_id: "BRL",
            unit_price:  planConfig.price,
          },
        ],
        payer: {
          email: normalizedEmail,
        },
        external_reference: externalReference,
        notification_url:   webhookUrl,
        back_urls: {
          success: `${APP_BASE_URL}/acesso-liberado`,
          failure: `${LANDING_BASE_URL}/pagamento-recusado`,
          pending: `${LANDING_BASE_URL}/pagamento-pendente`,
        },
        auto_return:        "approved",
        statement_descriptor: "BIBLIAALPHA",
        metadata: {
          email:   normalizedEmail,
          plan,
          product,
        },
      };

      const mpResponse = await axios.post(
        "https://api.mercadopago.com/checkout/preferences",
        preferenceData,
        {
          headers: {
            Authorization:  `Bearer ${MP_ACCESS_TOKEN.value()}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      const { id: preferenceId, init_point, sandbox_init_point } = mpResponse.data;

      // Salvar preferenceId na order
      await db.collection("orders").doc(externalReference).update({
        preferenceId,
        updatedAt: now,
      });

      console.log(`[createPreference] Preferência MP criada: ${preferenceId}`);

      res.status(200).json({
        preferenceId,
        checkoutUrl:        init_point,
        sandboxCheckoutUrl: sandbox_init_point,
        externalReference,
      });
    } catch (err: any) {
      console.error("[createPreference] Erro:", err?.response?.data || err?.message || err);
      res.status(500).json({
        error:   "Erro interno ao criar preferência de pagamento.",
        details: err?.response?.data?.message || err?.message,
      });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
// FUNÇÃO 2 — mercadoPagoWebhook
// Recebe notificações do MP e libera acesso no Firestore
// ═══════════════════════════════════════════════════════════════════
export const mercadoPagoWebhook = onRequest(
  {
    region:  REGION,
    secrets: [MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET],
    cors:    false,
    timeoutSeconds: 30,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      // ── 1. Validar assinatura x-signature (se secret configurado) ──
      const secret = MP_WEBHOOK_SECRET.value();
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
            console.warn("[webhook] Assinatura inválida — ignorando requisição");
            res.status(200).send("OK");  // 200 para evitar reenvio infinito
            return;
          }
        }
      }

      const body = req.body as {
        type?:   string;
        action?: string;
        data?:   { id?: string };
        id?:     string | number;
      };

      console.log("[webhook] Payload recebido:", JSON.stringify(body));

      // ── 2. Identificar o tipo de notificação ──
      const type = body.type || body.action || "";

      // Ignorar tipos não relacionados a pagamento
      const relevantTypes = ["payment", "payment.created", "payment.updated"];
      if (!relevantTypes.some((t) => type.includes(t)) && type !== "") {
        console.log(`[webhook] Tipo não monitorado: ${type} — ignorando`);
        res.status(200).send("OK");
        return;
      }

      // ── 3. Extrair payment_id ──
      const paymentId = (body.data?.id || body.id)?.toString();
      if (!paymentId) {
        console.warn("[webhook] Sem payment_id — ignorando");
        res.status(200).send("OK");
        return;
      }

      // ── 4. Consultar pagamento DIRETO na API do MP (NUNCA confiar só no payload) ──
      let payment: any;
      try {
        const mpRes = await axios.get(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${MP_ACCESS_TOKEN.value()}`,
            },
            timeout: 10000,
          }
        );
        payment = mpRes.data;
      } catch (err: any) {
        console.error(`[webhook] Erro ao consultar pagamento ${paymentId}:`, err?.response?.data || err?.message);
        // Retornar 200 para evitar reenvio; o MP vai reenviar mesmo assim se for erro de rede
        res.status(200).send("OK");
        return;
      }

      console.log(`[webhook] Pagamento ${paymentId} — status: ${payment.status}`);

      const externalReference: string | null = payment.external_reference || null;

      // ── 5. Buscar order no Firestore ──
      if (!externalReference) {
        console.warn(`[webhook] Pagamento ${paymentId} sem external_reference — ignorando`);
        res.status(200).send("OK");
        return;
      }

      const orderRef  = db.collection("orders").doc(externalReference);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        console.warn(`[webhook] Order ${externalReference} não encontrada`);
        res.status(200).send("OK");
        return;
      }

      const orderData = orderSnap.data()!;
      const email     = orderData.email as string;
      const plan      = orderData.plan  as string;
      const product   = orderData.product as string;

      if (!email) {
        console.error(`[webhook] Order ${externalReference} sem email — abortando`);
        res.status(200).send("OK");
        return;
      }

      const now = admin.firestore.FieldValue.serverTimestamp();

      // ── 6. Processar por status ──
      switch (payment.status) {

        case "approved": {
          // Evitar duplicar aprovação
          if (orderData.status === "approved") {
            console.log(`[webhook] Order ${externalReference} já aprovada — ignorando duplicata`);
            break;
          }

          const planConfig = PLANS[plan] || PLANS["anual"];

          // Calcular expiresAt
          let expiresAt: admin.firestore.Timestamp | null = null;
          if (planConfig.durationDays) {
            const exp = new Date();
            exp.setDate(exp.getDate() + planConfig.durationDays);
            expiresAt = admin.firestore.Timestamp.fromDate(exp);
          }

          const batch = db.batch();

          // Atualizar order
          batch.update(orderRef, {
            status:    "approved",
            paymentId: paymentId.toString(),
            approvedAt: now,
            updatedAt:  now,
          });

          // Criar/atualizar access/{email}
          const accessRef = db.collection("access").doc(email);
          batch.set(
            accessRef,
            {
              email,
              active:          true,
              status:          "active",
              product,
              plan,
              paymentProvider: "mercado_pago",
              paymentId:       paymentId.toString(),
              externalReference,
              approvedAt:      now,
              expiresAt:       expiresAt,
              lifetime:        planConfig.lifetime,
              updatedAt:       now,
              // Só seta createdAt se for novo documento
            },
            { merge: true }
          );

          // Garantir createdAt apenas na criação
          const accessSnap = await accessRef.get();
          if (!accessSnap.exists) {
            batch.set(accessRef, { createdAt: now }, { merge: true });
          }

          await batch.commit();

          console.log(`[webhook] ✅ Acesso LIBERADO para ${email} — plano ${plan} — pagamento ${paymentId}`);
          break;
        }

        case "pending":
        case "in_process": {
          await orderRef.update({
            status:    "pending",
            paymentId: paymentId.toString(),
            updatedAt: now,
          });
          console.log(`[webhook] Pagamento ${paymentId} em análise para ${email}`);
          break;
        }

        case "rejected":
        case "cancelled": {
          await orderRef.update({
            status:    payment.status,
            paymentId: paymentId.toString(),
            updatedAt: now,
          });
          console.log(`[webhook] Pagamento ${paymentId} ${payment.status} para ${email}`);
          break;
        }

        case "refunded":
        case "charged_back": {
          const batch = db.batch();

          // Desativar acesso
          const accessRef = db.collection("access").doc(email);
          const accessSnap = await accessRef.get();
          if (accessSnap.exists) {
            batch.update(accessRef, {
              active:    false,
              status:    payment.status === "refunded" ? "refunded" : "chargeback",
              updatedAt: now,
            });
          }

          batch.update(orderRef, {
            status:    payment.status,
            updatedAt: now,
          });

          await batch.commit();
          console.log(`[webhook] ⚠️ Acesso REVOGADO para ${email} — motivo: ${payment.status}`);
          break;
        }

        default:
          console.log(`[webhook] Status desconhecido: ${payment.status} — ignorando`);
      }

      res.status(200).send("OK");
    } catch (err: any) {
      console.error("[webhook] Erro inesperado:", err?.message || err);
      // Sempre 200 para evitar loop infinito de reenvio do MP
      res.status(200).send("OK");
    }
  }
);
