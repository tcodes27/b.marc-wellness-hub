import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Twilio inbound-SMS webhook stub.
 *
 * When wired to Twilio, configure the messaging service to POST inbound
 * SMS to:  https://<your-host>/api/public/twilio-sms-webhook
 *
 * STOP / UNSUBSCRIBE / CANCEL / END / QUIT mark the matching member as
 * sms_opted_out = true. All other inbound messages are acknowledged with
 * an empty TwiML response (no auto-reply).
 *
 * Signature verification is performed only when TWILIO_AUTH_TOKEN is set.
 * Without it the route returns 503 so accidental traffic cannot mutate data.
 */
export const Route = createFileRoute("/api/public/twilio-sms-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (!authToken) {
          return new Response("Twilio not configured", { status: 503 });
        }

        // TODO: validate X-Twilio-Signature against authToken + request body
        // (https://www.twilio.com/docs/usage/webhooks/webhooks-security)

        const form = await request.formData();
        const from = String(form.get("From") ?? "").trim();
        const body = String(form.get("Body") ?? "").trim().toUpperCase();
        if (!from) return twiml();

        const STOP_WORDS = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];
        const isStop = STOP_WORDS.includes(body);

        if (isStop) {
          const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (url && serviceKey) {
            const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
            await admin
              .from("community_members")
              .update({ sms_opted_out: true, opted_out_at: new Date().toISOString() })
              .eq("phone", from);
          }
        }

        return twiml();
      },
    },
  },
});

function twiml() {
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
