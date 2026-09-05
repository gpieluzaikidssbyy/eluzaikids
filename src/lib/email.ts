import * as QRCode from 'qrcode';
import { Resend } from 'resend';
import { formatDateIndo, formatTimeWib } from './helpers';

interface EmailInfo {
  type: 'Event' | 'Kegiatan';
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
      subject: `Konfirmasi Pendaftaran: ${info.title}`,
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

/**
 * Build HTML email content.
 */
function buildEmailHtml(
  name: string,
  info: EmailInfo,
  qrDataUrl: string
): string {
  const dateStr = info.date ? formatDateIndo(info.date) : '-';
  const timeStr = info.time ? formatTimeWib(info.time) : '-';
  const openGateStr = info.open_gate ? formatTimeWib(info.open_gate) : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #3a86ff, #1a4fd0); padding: 32px 24px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.85; }
    .content { padding: 24px; }
    .info-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 13px; color: #64748b; min-width: 120px; }
    .info-value { font-size: 14px; color: #1e293b; font-weight: 500; }
    .qr-section { text-align: center; padding: 24px; background: #f8fafc; border-radius: 12px; margin: 16px 0; }
    .qr-section img { width: 200px; height: 200px; }
    .qr-section p { margin: 12px 0 0; font-size: 12px; color: #64748b; }
    .footer { text-align: center; padding: 16px 24px; font-size: 12px; color: #94a3b8; }
    .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GPI Eluzai Kids</h1>
      <p>Konfirmasi Pendaftaran</p>
    </div>
    <div class="content">
      <p>Halo <strong>${name}</strong>,</p>
      <p>Terima kasih telah mendaftar untuk <strong>${info.title}</strong>. Berikut adalah detail pendaftaran Anda:</p>

      <div class="info-row">
        <span class="info-label">No. Registrasi</span>
        <span class="info-value">${info.nomor_registrasi}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Jenis</span>
        <span class="info-value">${info.type}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Jumlah Hadir</span>
        <span class="info-value">${info.jumlah_hadir} orang</span>
      </div>
      <div class="info-row">
        <span class="info-label">Tanggal</span>
        <span class="info-value">${dateStr}</span>
      </div>
      ${openGateStr ? `<div class="info-row">
        <span class="info-label">Open Gate</span>
        <span class="info-value">${openGateStr}</span>
      </div>` : ''}
      ${info.time ? `<div class="info-row">
        <span class="info-label">Waktu</span>
        <span class="info-value">${timeStr}</span>
      </div>` : ''}
      ${info.location ? `<div class="info-row">
        <span class="info-label">Lokasi</span>
        <span class="info-value">${info.location}</span>
      </div>` : ''}

      <div class="qr-section">
        <img src="${qrDataUrl}" alt="QR Code Pendaftaran" />
        <p>Tunjukkan QR Code ini saat hadir di lokasi acara</p>
      </div>

      ${info.maps_link ? `<p style="text-align:center;"><a href="${info.maps_link}" style="color:#3a86ff;text-decoration:none;font-weight:600;">📍 Lihat di Google Maps</a></p>` : ''}
    </div>
    <div class="footer">
      <p>Email ini dikirim otomatis oleh sistem GPI Eluzai Kids.</p>
      <p>Jika ada pertanyaan, silakan hubungi admin.</p>
    </div>
  </div>
</body>
</html>`;
}
