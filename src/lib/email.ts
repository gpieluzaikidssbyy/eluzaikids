import * as QRCode from 'qrcode';
import { Resend } from 'resend';
import { appBaseUrl, formatDateIndo, formatTimeWib } from './helpers';

interface EmailInfo {
  type: 'Event' | 'Activity';
  phone: string;
  email: string | null;
  nomor_registrasi: string;
  jumlah_hadir: number;
  qr_data: string;
  qr_url: string;
  title: string;
  date: string | null;
  open_gate: string | null;
  time: string | null;
  location: string | null;
  maps_link: string | null;
  registered_at: string;
}

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '-')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatEmailDate(value: string | Date, includeTime = false): string {
  const date = new Date(value);
  const datePart = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date);

  if (!includeTime) return datePart;

  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(date);

  return `${datePart}, ${timePart} WIB`;
}

/**
 * Generate QR code as base64 data URL.
 */
export async function generateQrDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

/**
 * Generate QR code as PNG buffer.
 */
export async function generateQrPng(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

/**
 * Send registration confirmation email via Resend API.
 */
export async function sendConfirmationEmail(
  name: string,
  phone: string,
  email: string | null,
  info: EmailInfo
): Promise<void> {
  if (!email) return;

  const apiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.RESEND_SENDER_EMAIL || 'noreply@gpieluzai.com';
  const senderName = process.env.RESEND_SENDER_NAME || 'GPI Eluzai Kids';

  if (!apiKey) {
    console.warn('Resend API key not configured, skipping email.');
    return;
  }

  const resend = new Resend(apiKey);

  const qrDataUrl = await generateQrDataUrl(info.qr_data);
  const htmlContent = buildEmailHtml(name, info, qrDataUrl);
  const qrPng = await generateQrPng(info.qr_data);

  try {
    const { error } = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: [email],
      subject: `Konfirmasi Pendaftaran: #${info.title}`,
      html: htmlContent,
      attachments: [
        {
          filename: `QR-${info.nomor_registrasi}.png`,
          content: qrPng,
        },
      ],
    });

    if (error) {
      console.error('Failed to send email:', error);
    }
  } catch (error) {
    console.error('Email sending error:', error);
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('Resend API key not configured, skipping password reset email.');
    return;
  }

  const senderEmail = process.env.RESEND_SENDER_EMAIL || 'noreply@gpieluzai.com';
  const senderName = process.env.RESEND_SENDER_NAME || 'GPI Eluzai Kids';
  const resend = new Resend(apiKey);
  const safeUrl = escapeHtml(resetUrl);

  const { error } = await resend.emails.send({
    from: `${senderName} <${senderEmail}>`,
    to: [email],
    subject: 'Reset Password Admin - GPI Eluzai Kids',
    html: `
      <div style="max-width:560px;margin:0 auto;padding:28px;font-family:Arial,sans-serif;color:#0f172a;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="margin:0 0 12px;color:#2563eb">Reset Password Admin</h2>
        <p>Gunakan tombol berikut untuk membuat password baru akun admin Anda.</p>
        <p><a href="${safeUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:700">Reset Password</a></p>
        <p style="color:#64748b;font-size:13px">Tautan ini berlaku selama 1 jam dan hanya dapat digunakan satu kali.</p>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
}

/**
 * Build HTML email content.
 */
function buildEmailHtml(
  name: string,
  info: EmailInfo,
  qrDataUrl: string
): string {
  const dateStr = info.date ? formatDateIndo(info.date) : '-';
  const timeStr = info.time ? `${info.time.slice(0, 5)} WIB` : '-';
  const openGateStr = info.open_gate ? formatTimeWib(info.open_gate) : null;
  const kindLabel = info.type === 'Event' ? 'Event' : 'Activity';
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(info.title);
  const safeEmail = escapeHtml(info.email);
  const safePhone = escapeHtml(info.phone);
  const safeRegistration = escapeHtml(info.nomor_registrasi);
  const safeLocation = escapeHtml(info.location);
  const safeDate = escapeHtml(dateStr);
  const safeTime = escapeHtml(timeStr);
  const safeOpenGate = escapeHtml(openGateStr);
  const mapsButton = info.maps_link
    ? `<a class="maps-button" href="${escapeHtml(info.maps_link)}">Buka lokasi di Google Maps</a>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 24px 12px; background: #f1f5f9; color: #0f172a; font-family: Arial, Helvetica, sans-serif; }
    .receipt { max-width: 620px; margin: 0 auto; overflow: hidden; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; }
    .header { padding: 18px 24px; background: #2563eb; color: #ffffff; }
    .brand { display: inline-block; vertical-align: middle; }
    .logo { width: 42px; height: 42px; margin-right: 10px; vertical-align: middle; object-fit: contain; background: #ffffff; border-radius: 6px; }
    .brand-name { display: inline-block; vertical-align: middle; font-size: 16px; font-weight: 700; }
    .brand-caption { display: block; margin-top: 3px; font-size: 10px; font-weight: 400; opacity: .85; }
    .content { padding: 28px 24px; }
    h1 { margin: 0; font-size: 20px; }
    h2 { margin: 0 0 18px; color: #2563eb; font-size: 12px; letter-spacing: .12em; }
    .intro { margin: 12px 0 24px; color: #475569; font-size: 13px; line-height: 1.7; }
    .section { padding: 20px 0; border-top: 1px solid #e2e8f0; }
    .row { padding: 9px 0; }
    .label { display: block; margin-bottom: 4px; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
    .value { color: #0f172a; font-size: 13px; font-weight: 600; line-height: 1.5; }
    .qr { margin: 8px auto 0; text-align: center; }
    .qr img { width: 190px; height: 190px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 5px; }
    .qr p { margin: 9px 0 0; color: #64748b; font-size: 11px; }
    .maps-button { display: inline-block; margin-top: 8px; padding: 10px 14px; border-radius: 5px; background: #2563eb; color: #ffffff !important; font-size: 12px; font-weight: 700; text-decoration: none; }
    .footer { padding: 18px 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 11px; line-height: 1.6; text-align: center; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <img class="logo" src="${escapeHtml(`${appBaseUrl()}/images/logo-placeholder.webp`)}" alt="GPI Eluzai Kids">
      <span class="brand"><span class="brand-name">GPI Eluzai Kids</span><span class="brand-caption">Bukti Pendaftaran ${kindLabel}</span></span>
    </div>
    <div class="content">
      <h1>Bukti Pendaftaran ${kindLabel}</h1>
      <p class="intro"><strong>Pendaftaran berhasil!</strong><br>Terima kasih telah melakukan pendaftaran. Simpan tanda terima ini sebagai bukti pendaftaran Anda.</p>

      <div class="section">
        <h2>REGISTRATION DETAILS</h2>
        <div class="row"><span class="label">Registration Code</span><span class="value">${safeRegistration}</span></div>
        <div class="row"><span class="label">Jumlah yang Hadir</span><span class="value">${escapeHtml(info.jumlah_hadir)} orang</span></div>
        <div class="row qr"><span class="label">QR Code Presensi</span><br><img src="${qrDataUrl}" alt="QR Code Pendaftaran"><p>Tunjukkan QR ini saat presensi di lokasi</p></div>
        <div class="row"><span class="label">${kindLabel}</span><span class="value">${safeTitle}</span></div>
        <div class="row"><span class="label">Tanggal ${kindLabel}</span><span class="value">${safeDate}</span></div>
        ${openGateStr ? `<div class="row"><span class="label">Open Gate</span><span class="value">${safeOpenGate}</span></div>` : ''}
        ${info.time ? `<div class="row"><span class="label">Waktu ${kindLabel}</span><span class="value">${safeTime}</span></div>` : ''}
        ${info.location ? `<div class="row"><span class="label">Lokasi</span><span class="value">${safeLocation}</span></div>` : ''}
        ${mapsButton}
      </div>

      <div class="section">
        <h2>PARTICIPANT DETAILS</h2>
        <div class="row"><span class="label">Nama Lengkap</span><span class="value">${safeName}</span></div>
        <div class="row"><span class="label">Nomor WhatsApp</span><span class="value">${safePhone}</span></div>
        <div class="row"><span class="label">Alamat Email</span><span class="value"><a href="mailto:${safeEmail}" style="color:#2563eb;">${safeEmail}</a></span></div>
      </div>

      <div class="section"><span class="label">Tanggal Pendaftaran</span><span class="value">${escapeHtml(formatEmailDate(info.registered_at, true))}</span></div>
    </div>
    <div class="footer">
      Terima kasih dan sampai bertemu!<br><br>
      © 2026 GPI ELUZAI KIDS. ALL RIGHTS RESERVED •
    </div>
  </div>
</body>
</html>`;
}
