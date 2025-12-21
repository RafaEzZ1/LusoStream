// src/app/api/notify-suggestion/route.js
export async function POST(req) {
  try {
    const { to, subject, html, text } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const provider = process.env.MAIL_PROVIDER || "resend"; // "resend" | "mailtrap"

    if (provider === "resend") {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const FROM = process.env.RESEND_FROM || "LusoStream <no-reply@yourdomain.com>";
      if (!RESEND_API_KEY) {
        return Response.json({ ok: false, error: "missing_resend_key" }, { status: 500 });
      }
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: FROM, to, subject, html, text }),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) {
        return Response.json({ ok: false, error: data?.message || "send_failed" }, { status: 500 });
      }
      return Response.json({ ok: true });
    }

    if (provider === "mailtrap") {
      const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN;
      const FROM_EMAIL = process.env.MAILTRAP_FROM || "no-reply@example.com";
      if (!MAILTRAP_TOKEN) {
        return Response.json({ ok: false, error: "missing_mailtrap_token" }, { status: 500 });
      }
      const r = await fetch("https://send.api.mailtrap.io/api/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MAILTRAP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: { email: FROM_EMAIL, name: "LusoStream" },
          to: [{ email: to }],
          subject,
          text: text || undefined,
          html: html || undefined,
        }),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) {
        return Response.json(
          { ok: false, error: data?.errors?.[0]?.message || "send_failed" },
          { status: 500 }
        );
      }
      return Response.json({ ok: true });
    }

    return Response.json({ ok: false, error: "provider_not_supported" }, { status: 500 });
  } catch (e) {
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
