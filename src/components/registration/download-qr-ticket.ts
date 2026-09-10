/**
 * Generate and download the QR presence ticket as a PNG image.
 * Runs entirely client-side on an off-screen canvas.
 */
export async function downloadQrTicket(
  qrUrl: string,
  nomorRegistrasi: string,
  registrableTitle: string
): Promise<void> {
  const qrImg = new Image();
  qrImg.src = qrUrl;
  await qrImg.decode();

  const W = 600;
  const H = 820;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const centerText = (
    text: string,
    y: number,
    font: string,
    color: string,
    maxWidth = W - 120
  ) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let shown = text;
    if (ctx.measureText(shown).width > maxWidth) {
      while (ctx.measureText(`${shown}…`).width > maxWidth && shown.length > 0) {
        shown = shown.slice(0, -1);
      }
      shown = `${shown}…`;
    }
    ctx.fillText(shown, W / 2, y, maxWidth);
  };

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, W, H);

  roundRect(24, 24, W - 48, H - 48, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.stroke();

  const mono = '"JetBrains Mono", ui-monospace, Consolas, monospace';

  centerText('GPI ELUZAI KIDS', 96, '800 22px Inter, system-ui, sans-serif', '#7c3aed');
  centerText('QR CODE PRESENSI', 140, '800 36px Inter, system-ui, sans-serif', '#0f172a');
  centerText(registrableTitle, 172, '600 20px Inter, system-ui, sans-serif', '#64748b');

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 206);
  ctx.lineTo(W - 80, 206);
  ctx.stroke();

  const qrSize = 320;
  const qrX = (W - qrSize) / 2;
  const qrY = 232;
  ctx.fillStyle = '#ffffff';
  roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 20);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  centerText('NO. REGISTRASI', 612, '700 18px Inter, system-ui, sans-serif', '#475569');

  let numSize = 44;
  const setNumFont = () => {
    ctx.font = `800 ${numSize}px ${mono}`;
  };
  setNumFont();
  while (ctx.measureText(nomorRegistrasi).width > W - 120 && numSize > 24) {
    numSize -= 2;
    setNumFont();
  }
  centerText(nomorRegistrasi, 668, `800 ${numSize}px ${mono}`, '#7c3aed');

  centerText('Simpan gambar ini sebagai bukti pendaftaran.', 748, '500 16px Inter, system-ui, sans-serif', '#94a3b8');

  const link = document.createElement('a');
  link.download = `qr-presensi-${nomorRegistrasi}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}