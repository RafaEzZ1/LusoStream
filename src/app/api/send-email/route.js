// src/app/api/send-email/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

function getTransporter() {
  const host = process.env.MAILTRAP_HOST;
  const port = Number(process.env.MAILTRAP_PORT || 587);
  const user = process.env.MAILTRAP_USER;
  const pass = process.env.MAILTRAP_PASS;

  if (!host || !user || !pass) {
    throw new Error("MAILTRAP_* env vars em falta.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // STARTTLS
    auth: { user, pass },
  });
}

export async function POST(req) {
  try {
    const { to, subject, html, text } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { ok: false, error: "Campos obrigatórios: to, subject e html ou text." },
        { status: 400 }
      );
    }

    const from = process.env.MAILTRAP_FROM || "no-reply@example.com";
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || "",
      html: html || undefined,
    });

    return NextResponse.json({ ok: true, id: info.messageId });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
