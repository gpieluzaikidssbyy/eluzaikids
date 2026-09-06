import * as QRCode from 'qrcode';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Resend } from 'resend';
import { appBaseUrl, formatTimeWib } from './helpers';

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
 * Fallback logo URL used inside email HTML (hosted path).
 */
function hostedLogoUrl(): string {
  return `${appBaseUrl()}/images/logo1.webp`;
}

/**
 * Embed the church logo as an inline attachment (cid:logo) so it renders in
 * email clients that block data:/external images (e.g. Gmail). Falls back to
 * the hosted URL when the local file cannot be read.
 * The email header uses the dedicated letterhead file (images/logo1.webp);
 * the website logo is untouched.
 */
function resolveLogo(): { src: string; buffer: Buffer | null } {
  try {
    const buffer = readFileSync(path.join(process.cwd(), 'public', 'images', 'logo1.webp'));
    return { src: 'cid:logo', buffer };
  } catch {
    return { src: hostedLogoUrl(), buffer: null };
  }
}

function logoInlineAttachment(logo: { buffer: Buffer | null }): Array<{
  filename: string;
  content: Buffer;
  contentId: string;
}> {
  return logo.buffer ? [{ filename: 'logo1.webp', content: logo.buffer, contentId: 'logo' }] : [];
}

function senderConfig() {
  const email = process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev';
  const name = process.env.RESEND_SENDER_NAME || 'GPI Eluzai Kids';
  return { email, name };
}

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Shared email styles for a consistent, professional look across templates.
 * Uses a system font stack (email clients strip web fonts) plus generous
 * spacing, hierarchy and alignment.
 */
const emailStyles = `
    body { margin: 0; padding: 32px 16px; background: #f1f5f9; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .receipt { max-width: 600px; margin: 0 auto; overflow: hidden; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; }
    .header { padding: 22px 28px; background: #2563eb; color: #ffffff; line-height: 1.2; }
    .logo { width: 44px; height: 44px; margin-right: 12px; vertical-align: middle; object-fit: cover; border-radius: 50%; background: #ffffff; padding: 3px; box-sizing: border-box; }
    .brand-name { display: inline-block; vertical-align: middle; font-size: 17px; font-weight: 700; letter-spacing: .01em; }
    .content { padding: 32px 28px; }
    h1 { margin: 0; font-size: 22px; line-height: 1.3; text-transform: uppercase; letter-spacing: .02em; color: #0f172a; }
    .intro { margin: 14px 0 26px; color: #475569; font-size: 14px; line-height: 1.7; }
    .section { padding: 22px 0; border-top: 1px solid #e2e8f0; }
    h2 { margin: 0 0 18px; color: #2563eb; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
    .row { padding: 5px 0 13px; }
    .label { display: block; margin-bottom: 3px; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
    .value { color: #0f172a; font-size: 14px; font-weight: 600; line-height: 1.5; }
    .qr { padding: 6px 0 16px; text-align: center; }
    .qr img { width: 200px; height: 200px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
    .qr p { margin: 10px 0 0; color: #94a3b8; font-size: 12px; }
    .link { color: #2563eb; text-decoration: underline; word-break: break-all; }
    .buttonspace { margin: 22px 0 8px; }
    .reset-button { display: inline-block; padding: 13px 20px; border-radius: 6px; background: #2563eb; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; }
    .maps-button { display: inline-block; margin-top: 6px; padding: 11px 16px; border-radius: 6px; background: #2563eb; color: #ffffff !important; font-size: 13px; font-weight: 600; text-decoration: none; }
    .fallback { border-top: 1px solid #e2e8f0; margin-top: 26px; padding-top: 18px; }
    .fallback p { margin: 0; color: #64748b; font-size: 13px; line-height: 1.6; }
    .muted { margin: 22px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.6; }
    .footer { padding: 20px 28px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; line-height: 1.6; text-align: center; }
`;

/**
 * Send registration confirmation email via Resend.
 * The QR code and church logo are embedded as inline attachments so they
 * render directly in the email body (no external Drive/files).
 * For testing, the "from" is the Resend shared sender (onboarding@resend.dev);
 * swap RESEND_SENDER_EMAIL to the verified domain once available.
 */
export async function sendConfirmationEmail(
  name: string,
  phone: string,
  email: string | null,
  info: EmailInfo
): Promise<void> {
  if (!email) return;

  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend API key not configured, skipping email.');
    return;
  }

  const { email: senderEmail, name: senderName } = senderConfig();
  const logo = resolveLogo();
  const qrPng = await generateQrPng(info.qr_data);
  const htmlContent = buildEmailHtml(name, info, logo.src);

  try {
    await getResend().emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: [email],
      subject: `Konfirmasi Pendaftaran: #${info.title}`,
      html: htmlContent,
      headers: { 'X-Entity-Ref-ID': info.nomor_registrasi },
      attachments: [
        ...logoInlineAttachment(logo),
        {
          filename: `QR-${info.nomor_registrasi}.png`,
          content: qrPng,
          contentId: 'qr-presensi',
        },
      ],
    });
  } catch (error) {
    console.error('Email sending error:', error);
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Resend API key not configured. Set RESEND_API_KEY.');
  }

  const { email: senderEmail, name: senderName } = senderConfig();
  const logo = resolveLogo();
  const safeUrl = escapeHtml(resetUrl);

  await getResend().emails.send({
    from: `${senderName} <${senderEmail}>`,
    to: [email],
    subject: 'Reset Password Admin - GPI Eluzai Kids',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${emailStyles}
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <img class="logo" src="${escapeHtml(logo.src)}" alt="GPI Eluzai Kids">
      <span class="brand-name">GPI Eluzai Kids</span>
    </div>
    <div class="content">
      <h1>Reset Password Admin</h1>
      <p class="intro"><strong>Permintaan reset password diterima.</strong><br>Gunakan tombol berikut untuk membuat password baru akun admin Anda.</p>
      <p class="buttonspace"><a href="${safeUrl}" class="reset-button">Reset Password</a></p>
      <div class="fallback">
        <p>Jika tombol tidak berfungsi, salin tautan berikut ke browser Anda:</p>
        <p style="margin-top:8px;"><a class="link" href="${safeUrl}">${safeUrl}</a></p>
      </div>
      <p class="muted">Tautan ini berlaku selama 1 jam dan hanya dapat digunakan satu kali.</p>
    </div>
    <div class="footer">
      © 2026 GPI ELUZAI KIDS. ALL RIGHTS RESERVED
    </div>
  </div>
</body>
</html>
    `,
    attachments: [...logoInlineAttachment(logo)],
  });
}

/**
 * Build the confirmation email HTML content.
 */
function buildEmailHtml(name: string, info: EmailInfo, logoSrc: string): string {
  const dateStr = info.date ? formatEmailDate(info.date) : '-';
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
    ? `<div class="row"><span class="label">Lokasi</span><span class="value">${safeLocation}</span><a class="maps-button" href="${escapeHtml(info.maps_link)}">Buka lokasi di Google Maps</a></div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${emailStyles}
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <img class="logo" src="${escapeHtml(logoSrc)}" alt="GPI Eluzai Kids">
      <span class="brand-name">GPI Eluzai Kids</span>
    </div>
    <div class="content">
      <h1>Bukti Pendaftaran ${kindLabel}</h1>
      <p class="intro">
        <strong>Pendaftaran berhasil!</strong><br>
        Terima kasih telah melakukan pendaftaran.<br>
        Simpan tanda terima ini sebagai bukti pendaftaran Anda.
      </p>

      <div class="section">
        <h2>Registration Details</h2>
        <div class="row"><span class="label">Registration Code</span><span class="value">${safeRegistration}</span></div>
        <div class="row"><span class="label">Jumlah yang Hadir</span><span class="value">${escapeHtml(info.jumlah_hadir)} orang</span></div>
        <div class="row"><span class="label">QR Code Presensi</span><div class="qr"><img src="cid:qr-presensi" alt="QR Code Presensi"><p>Tunjukkan QR ini saat presensi di lokasi</p></div></div>
        <div class="row"><span class="label">${kindLabel}</span><span class="value">${safeTitle}</span></div>
        <div class="row"><span class="label">Tanggal ${kindLabel}</span><span class="value">${safeDate}</span></div>
        ${openGateStr ? `<div class="row"><span class="label">Open Gate</span><span class="value">${safeOpenGate}</span></div>` : ''}
        ${info.time ? `<div class="row"><span class="label">Waktu ${kindLabel}</span><span class="value">${safeTime}</span></div>` : ''}
        ${info.location && !mapsButton ? `<div class="row"><span class="label">Lokasi</span><span class="value">${safeLocation}</span></div>` : ''}
        ${mapsButton}
      </div>

      <div class="section">
        <h2>Participant Details</h2>
        <div class="row"><span class="label">Nama Lengkap</span><span class="value">${safeName}</span></div>
        <div class="row"><span class="label">Nomor WhatsApp</span><span class="value">${safePhone}</span></div>
        <div class="row"><span class="label">Alamat Email</span><span class="value"><a class="link" href="mailto:${safeEmail}">${safeEmail}</a></span></div>
      </div>

      <div class="section"><span class="label">Tanggal Pendaftaran</span><span class="value">${escapeHtml(formatEmailDate(info.registered_at, true))}</span></div>
    </div>
    <div class="footer">
      © 2026 GPI ELUZAI KIDS. ALL RIGHTS RESERVED
    </div>
  </div>
</body>
</html>`;
}