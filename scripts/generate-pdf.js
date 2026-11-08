const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generateMediaKitPdf() {
  const outputPath = path.join(__dirname, '../public/media-kit-sumbar-terkini.pdf');
  const logoPath = path.join(__dirname, '../public/logo-sumbar-terkini.png');

  // Create a multi-page A4 document
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 36, bottom: 36, left: 36, right: 36 },
    info: {
      Title: 'Sumbar Terkini Official Media Kit & Rate Card 2026',
      Author: 'Sumbar Terkini Digital Media Network',
      Subject: 'Paid Promote & Endorsement Rate Card',
      Keywords: 'Media Kit, Sumbar Terkini, Padang, Sumatera Barat, Rate Card, Paid Promote',
    },
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Design Tokens
  const COLOR_INK = '#1E1E1E';
  const COLOR_PAPER = '#FAF8F5';
  const COLOR_MUSTARD = '#FFD166';
  const COLOR_MINT = '#06D6A0';
  const COLOR_CORAL = '#EF476F';
  const COLOR_WHITE = '#FFFFFF';
  const COLOR_MUTED = '#555555';

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const CONTENT_WIDTH = PAGE_WIDTH - 72; // 523.28

  // Helper to draw background
  function drawPageBackground() {
    doc.save();
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLOR_PAPER);
    doc.restore();
  }

  // Helper for Neo-Brutalist Box
  function drawNeoBox(x, y, w, h, bgColor = COLOR_WHITE, borderColor = COLOR_INK) {
    doc.save();
    // Shadow
    doc.rect(x + 3, y + 3, w, h).fill(COLOR_INK);
    // Main Box
    doc.rect(x, y, w, h).fillAndStroke(bgColor, borderColor).lineWidth(2);
    doc.restore();
  }

  // =========================================================================
  // PAGE 1: Brand Profile, Reach, & Social Media Metrics
  // =========================================================================
  drawPageBackground();

  // Top Accent Banner
  drawNeoBox(36, 36, CONTENT_WIDTH, 28, COLOR_MUSTARD);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_INK);
  doc.text(
    'SUMBAR TERKINI • MEDIA KIT & PAID PROMOTE RESMI 2026 • 330.200+ FOLLOWERS',
    36,
    44,
    { width: CONTENT_WIDTH, align: 'center' }
  );

  // Hero Card with Logo
  drawNeoBox(36, 76, CONTENT_WIDTH, 140, COLOR_WHITE);
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 52, 90, { width: 110, height: 110 });
  }

  doc.font('Helvetica-Bold').fontSize(24).fillColor(COLOR_INK);
  doc.text('SUMBAR TERKINI', 180, 92);

  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_MUTED);
  doc.text('@sumbarterkini_id • Media Berita & Viral Sumatera Barat', 180, 120);

  doc.font('Helvetica').fontSize(9.5).fillColor(COLOR_INK);
  doc.text(
    'Suara terdepan informasi digital, politik, kebijakan publik, dan peristiwa viral di Sumatera Barat serta nasional. Menghubungkan jutaan masyarakat Minang di ranah dan rantau dengan engagement organik terverifikasi.',
    180,
    140,
    { width: CONTENT_WIDTH - 156, lineGap: 3 }
  );

  // Big Stat Badges Row
  const statBoxWidth = (CONTENT_WIDTH - 24) / 3;
  drawNeoBox(36, 230, statBoxWidth, 68, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_MUTED);
  doc.text('TOTAL AUDIENS AKTIF', 48, 242);
  doc.font('Helvetica-Bold').fontSize(18).fillColor(COLOR_INK);
  doc.text('330.200+', 48, 258);
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('IG + TikTok + FB Page', 48, 280);

  drawNeoBox(36 + statBoxWidth + 12, 230, statBoxWidth, 68, COLOR_MINT);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_INK);
  doc.text('JANGKAUAN BULANAN', 48 + statBoxWidth + 12, 242);
  doc.font('Helvetica-Bold').fontSize(18).fillColor(COLOR_INK);
  doc.text('12.5 Juta+', 48 + statBoxWidth + 12, 258);
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_INK);
  doc.text('Total Tayangan & Reach', 48 + statBoxWidth + 12, 280);

  drawNeoBox(36 + (statBoxWidth + 12) * 2, 230, statBoxWidth, 68, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_MUTED);
  doc.text('STANDAR KONTEN', 48 + (statBoxWidth + 12) * 2, 242);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_INK);
  doc.text('FREE STORY', 48 + (statBoxWidth + 12) * 2, 258);
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('Include di Semua Paket', 48 + (statBoxWidth + 12) * 2, 280);

  // 3 Platforms Breakdown
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_INK);
  doc.text('Jangkauan & Metrik 3 Platform Resmi', 36, 318);

  // Instagram Card
  drawNeoBox(36, 342, CONTENT_WIDTH, 96, COLOR_WHITE);
  doc.save();
  doc.rect(36, 342, 6, 96).fill('#E1306C');
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#E1306C');
  doc.text('Instagram • @sumbarterkini_id', 54, 354);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_INK);
  doc.text('31.500 (31,5K) Followers  |  Avg. ER: 4.8%', 54, 372);
  doc.font('Helvetica').fontSize(9).fillColor(COLOR_MUTED);
  doc.text(
    '• Jangkauan per Post / Reels: 25.000 - 120.000+ akun\n• Tayangan Bulanan: 1.8 Juta+ tayangan / bulan\n• Avg. Story Views (24 Jam): 3.500 - 6.200 penonton aktif',
    54,
    390,
    { lineGap: 3 }
  );

  // TikTok Card
  drawNeoBox(36, 450, CONTENT_WIDTH, 96, COLOR_WHITE);
  doc.save();
  doc.rect(36, 450, 6, 96).fill('#000000');
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_INK);
  doc.text('TikTok • @sumbarterkini_id', 54, 462);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_INK);
  doc.text('86.200 (86,2K) Followers  |  Avg. ER: 7.4% (FYP Engine)', 54, 480);
  doc.font('Helvetica').fontSize(9).fillColor(COLOR_MUTED);
  doc.text(
    '• Video Views Organik: 45.000 - 500.000+ views (Algoritma FYP kuat)\n• Tayangan Bulanan: 4.5 Juta+ tayangan / bulan\n• Avg. Shares & Saves: 800 - 3.500+ interaksi per video viral',
    54,
    498,
    { lineGap: 3 }
  );

  // Facebook Card
  drawNeoBox(36, 558, CONTENT_WIDTH, 96, COLOR_WHITE);
  doc.save();
  doc.rect(36, 558, 6, 96).fill('#1877F2');
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#1877F2');
  doc.text('Facebook Page • Sumbar Terkini', 54, 570);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_INK);
  doc.text('212.500 (212,5K) Followers  |  Avg. ER: 3.9%', 54, 588);
  doc.font('Helvetica').fontSize(9).fillColor(COLOR_MUTED);
  doc.text(
    '• Post Reach: 65.000 - 350.000+ akun (sangat kuat usia 25-54 tahun)\n• Jangkauan Bulanan: 6.2 Juta+ jangkauan / bulan\n• Komunitas terhubung: Padang, Bukittinggi, Riau, hingga perantau Jabodetabek',
    54,
    606,
    { lineGap: 3 }
  );

  // Audience Demographics Summary
  drawNeoBox(36, 668, CONTENT_WIDTH, 120, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR_INK);
  doc.text('Demografi Audiens & Wilayah Sebaran', 50, 680);

  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_MUTED);
  doc.text('SEBARAN LOKASI UTAMA:', 50, 700);
  doc.font('Helvetica').fontSize(9).fillColor(COLOR_INK);
  doc.text('• Sumatera Barat (Padang, Bukittinggi, Payakumbuh, Pariaman, Solok): 68%', 50, 715);
  doc.text('• Jabodetabek, Riau, & Perantau Minang Nusantara: 24%', 50, 730);
  doc.text('• Nasional Lainnya: 8%', 50, 745);

  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_MUTED);
  doc.text('RENTANG USIA DOMINAN (90% Produktif):', 310, 700);
  doc.font('Helvetica').fontSize(9).fillColor(COLOR_INK);
  doc.text('• 18 - 24 Tahun: 25%', 310, 715);
  doc.text('• 25 - 34 Tahun: 42% (Tertinggi)', 310, 730);
  doc.text('• 35 - 44 Tahun: 23%   |   45+ Tahun: 10%', 310, 745);

  // Footer P1
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('Sumbar Terkini Official Media Kit • Halaman 1 dari 2', 36, 804, { width: CONTENT_WIDTH, align: 'center' });

  // =========================================================================
  // PAGE 2: Official Rate Card & Terms
  // =========================================================================
  doc.addPage();
  drawPageBackground();

  // Top Alert: Free Story in Every Promo
  drawNeoBox(36, 36, CONTENT_WIDTH, 36, COLOR_MINT);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_INK);
  doc.text('PROMO SPESIAL: SETIAP PASANG IKLAN OTOMATIS FREE 1X INSTAGRAM STORY 24 JAM', 36, 48, {
    width: CONTENT_WIDTH,
    align: 'center',
  });

  doc.font('Helvetica-Bold').fontSize(16).fillColor(COLOR_INK);
  doc.text('Daftar Tarif & Paket Paid Promote 2026', 36, 88);

  // Rate Card Cards
  // 1. Foto / Desain
  drawNeoBox(36, 112, CONTENT_WIDTH, 68, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR_INK);
  doc.text('1. Foto / Desain (Carousel)', 50, 122);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_INK);
  doc.text('Rp150.000', CONTENT_WIDTH - 60, 122, { align: 'right' });
  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_MUTED);
  doc.text(
    'Maksimal 10 slide carousel di 1 platform pilihan (IG, TikTok, atau FB). Bebas fitur Collab Post & tag akun gratis.\nBONUS: Termasuk 1x Free Instagram Story 24 Jam.',
    50,
    140,
    { width: CONTENT_WIDTH - 28, lineGap: 2 }
  );

  // 2. Video Reels
  drawNeoBox(36, 190, CONTENT_WIDTH, 68, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR_INK);
  doc.text('2. Video Reels', 50, 200);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_INK);
  doc.text('Rp200.000', CONTENT_WIDTH - 60, 200, { align: 'right' });
  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_MUTED);
  doc.text(
    'Durasi maksimal 3 menit di 1 platform pilihan (IG, TikTok, atau FB). Bebas fitur Collab Post & tag akun.\nBONUS: Termasuk 1x Free Instagram Story 24 Jam.',
    50,
    218,
    { width: CONTENT_WIDTH - 28, lineGap: 2 }
  );

  // 3. Paket Combo Reels (Best Seller)
  drawNeoBox(36, 268, CONTENT_WIDTH, 78, COLOR_MUSTARD);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR_INK);
  doc.text('3. Paket Combo Reels  [PALING LARIS / POPULAR]', 50, 278);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(COLOR_INK);
  doc.text('Rp300.000', CONTENT_WIDTH - 60, 278, { align: 'right' });
  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_INK);
  doc.text(
    'Durasi maksimal 3 menit High Definition. Mirroring tayang serentak di 3 platform sekaligus: IG, TikTok, dan Facebook!\nBebas fitur Collab Post di semua kanal. Menjangkau 330.200+ followers secara simultan.\nBONUS: Termasuk 1x Free Instagram Story 24 Jam dengan link sticker aktif.',
    50,
    296,
    { width: CONTENT_WIDTH - 28, lineGap: 2 }
  );

  // 4. Instagram Story Standalone
  drawNeoBox(36, 356, CONTENT_WIDTH, 64, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR_INK);
  doc.text('4. Instagram Story Standalone', 50, 366);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_INK);
  doc.text('Rp50.000', CONTENT_WIDTH - 60, 366, { align: 'right' });
  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_MUTED);
  doc.text(
    'Harga per tayangan selama 24 jam penuh di Instagram Story. Bebas mention & tag akun bisnis Anda serta stiker tautan langsung (link sticker ke WhatsApp / Website). Cocok untuk flash promo harian.',
    50,
    384,
    { width: CONTENT_WIDTH - 28, lineGap: 2 }
  );

  // 5. Langganan Bulanan
  drawNeoBox(36, 430, CONTENT_WIDTH, 78, COLOR_WHITE);
  doc.save();
  doc.rect(36, 430, 6, 78).fill(COLOR_MINT);
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR_INK);
  doc.text('5. Langganan Bulanan  [BEST VALUE - HEMAT Rp600.000]', 50, 440);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(COLOR_INK);
  doc.text('Rp600.000', CONTENT_WIDTH - 60, 440, { align: 'right' });
  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_MUTED);
  doc.text(
    '4 kali tayang dalam sebulan dengan jadwal fleksibel. Setiap penayangan Mirroring di IG, TikTok, dan Facebook (Total 12 postingan!). Bebas pilih format Foto / Slides / Reels. Bebas Collab Post di seluruh jadwal.\nBONUS: Termasuk 4x Free Instagram Stories selama periode langganan.',
    50,
    458,
    { width: CONTENT_WIDTH - 28, lineGap: 2 }
  );

  // Terms & Conditions Brief
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR_INK);
  doc.text('Syarat & Ketentuan Kemitraan (T&C)', 36, 526);

  drawNeoBox(36, 544, CONTENT_WIDTH, 140, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_INK);
  doc.text('1. Ketentuan Konten: ', 48, 554, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Tidak menerima SARA, judi online, pinjol ilegal, atau skema penipuan. Produk obat/makanan wajib berizin BPOM/PIRT.');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('2. Materi Siap Unggah: ', 48, 574, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Materi (foto/video/caption/link) disiapkan pengiklan. Wajib dikirim maksimal H-1 via WA Dokumen atau Google Drive.');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('3. Pembayaran & Slot: ', 48, 594, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Slot dikunci setelah full payment. Reschedule maksimal 1x (konfirmasi minimal H-1 / 24 jam sebelum tayang).');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('4. Batas Tanggung Jawab: ', 48, 614, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Story tayang 24 jam penuh; feed permanen. Pengelola menyediakan ruang promosi dan tidak bertanggung jawab atas konversi transaksi pembeli.');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('5. Fitur Collab Post: ', 48, 634, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Gratis fitur Collab Post Instagram di seluruh paket postingan feed & reels tanpa biaya tambahan.');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('6. Bonus Story: ', 48, 654, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Setiap pemesanan promosi (Foto, Reels, Combo, Langganan) otomatis mendapatkan 1x repost Free Instagram Story.');

  // Contact Footer Box
  drawNeoBox(36, 698, CONTENT_WIDTH, 84, COLOR_MUSTARD);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_INK);
  doc.text('Pemesanan Slot & Konsultasi Resmi', 50, 710);

  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_INK);
  doc.text('WhatsApp: 0896-1766-2378  (https://wa.me/6289617662378)', 50, 730);
  doc.text('Email Kemitraan: mrrobot4444@gmail.com', 50, 746);
  doc.text('Alamat Kantor: Padang, Sumatera Barat, Indonesia', 50, 762);

  // Footer P2
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('Sumbar Terkini Official Media Kit • Halaman 2 dari 2', 36, 804, { width: CONTENT_WIDTH, align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log('✅ Media Kit PDF successfully generated at:', outputPath);
      resolve(outputPath);
    });
    writeStream.on('error', reject);
  });
}

generateMediaKitPdf().catch(console.error);
