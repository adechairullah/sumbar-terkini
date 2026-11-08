const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generateMediaKitPdf() {
  const outputPath = path.join(__dirname, '../public/media-kit-sumbar-terkini.pdf');
  const logoPath = path.join(__dirname, '../public/logo-sumbar-terkini.png');

  // Create a multi-page A4 document
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 32, bottom: 32, left: 32, right: 32 },
    info: {
      Title: 'Sumbar Terkini Official Media Kit & Rate Card 2026',
      Author: 'Sumbar Terkini Digital Media Network',
      Subject: 'Paid Promote & Endorsement Rate Card',
      Keywords: 'Media Kit, Sumbar Terkini, Padang, Sumatera Barat, Rate Card, Paid Promote',
    },
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Design Tokens - Neo-Brutalist Soft Palette
  const COLOR_INK = '#1E1E1E';
  const COLOR_PAPER = '#FAF8F5';
  const COLOR_MUSTARD = '#FFD166';
  const COLOR_MINT = '#06D6A0';
  const COLOR_CORAL = '#EF476F';
  const COLOR_WHITE = '#FFFFFF';
  const COLOR_MUTED = '#4A4A4A';
  const COLOR_BORDER = '#1E1E1E';

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN = 32;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 531.28

  // Helper to draw background
  function drawPageBackground() {
    doc.save();
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLOR_PAPER);
    doc.restore();
  }

  // Helper for Neo-Brutalist Box with clean borders & shadows
  function drawNeoBox(x, y, w, h, bgColor = COLOR_WHITE, borderColor = COLOR_BORDER, shadowOffset = 3) {
    doc.save();
    // Shadow
    doc.rect(x + shadowOffset, y + shadowOffset, w, h).fill(COLOR_INK);
    // Main Box
    doc.rect(x, y, w, h).fillAndStroke(bgColor, borderColor).lineWidth(1.75);
    doc.restore();
  }

  // =========================================================================
  // PAGE 1: Brand Profile, Reach, & Social Media Metrics
  // =========================================================================
  drawPageBackground();

  // Top Accent Banner
  drawNeoBox(MARGIN, 32, CONTENT_WIDTH, 26, COLOR_MUSTARD);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_INK);
  doc.text(
    'SUMBAR TERKINI • MEDIA KIT & PAID PROMOTE RESMI 2026 • 330.200+ TOTAL FOLLOWERS',
    MARGIN,
    40,
    { width: CONTENT_WIDTH, align: 'center' }
  );

  // Hero Card with Logo
  drawNeoBox(MARGIN, 68, CONTENT_WIDTH, 124, COLOR_WHITE);
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, MARGIN + 14, 78, { width: 104, height: 104 });
  }

  const heroTextX = MARGIN + 130;
  const heroTextWidth = CONTENT_WIDTH - 144;

  doc.font('Helvetica-Bold').fontSize(22).fillColor(COLOR_INK);
  doc.text('SUMBAR TERKINI', heroTextX, 78);

  doc.font('Helvetica-Bold').fontSize(10).fillColor('#B71C1C');
  doc.text('Suara Terdepan Informasi, Politik & Berita Viral Sumatera Barat', heroTextX, 104);

  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_MUTED);
  doc.text('@sumbarterkini_id  •  Padang, Sumatera Barat', heroTextX, 120);

  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_INK);
  doc.text(
    'Media informasi digital terkemuka di Sumatera Barat menyajikan liputan berita terkini, analisis kebijakan publik, dan peristiwa viral secara cepat, tajam, dan terpercaya. Menjangkau jutaan audiens Minangkabau di ranah dan rantau.',
    heroTextX,
    136,
    { width: heroTextWidth, lineGap: 2.5 }
  );

  // Big Stat Badges Row (3 Cards)
  const statCardW = (CONTENT_WIDTH - 16) / 3;
  const statY = 204;
  const statH = 60;

  // Card 1
  drawNeoBox(MARGIN, statY, statCardW, statH, '#FFF8E7');
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('TOTAL AUDIENS AKTIF', MARGIN + 10, statY + 8);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(COLOR_INK);
  doc.text('330.200+ Akun', MARGIN + 10, statY + 22);
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_MUTED);
  doc.text('IG (31.5K) • TikTok (86.2K) • FB (212.5K)', MARGIN + 10, statY + 42);

  // Card 2
  drawNeoBox(MARGIN + statCardW + 8, statY, statCardW, statH, '#E8FAF4');
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('JANGKAUAN BULANAN', MARGIN + statCardW + 18, statY + 8);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(COLOR_INK);
  doc.text('12.5 Juta+ Views', MARGIN + statCardW + 18, statY + 22);
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_MUTED);
  doc.text('Akumulasi tayangan lintas 3 platform', MARGIN + statCardW + 18, statY + 42);

  // Card 3
  drawNeoBox(MARGIN + (statCardW + 8) * 2, statY, statCardW, statH, '#FFEBEF');
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('GARANSI KONTEN', MARGIN + (statCardW + 8) * 2 + 10, statY + 8);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_INK);
  doc.text('FREE INSTASTORY', MARGIN + (statCardW + 8) * 2 + 10, statY + 23);
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_MUTED);
  doc.text('Sudah include di setiap paket promo', MARGIN + (statCardW + 8) * 2 + 10, statY + 42);

  // Section Heading: 3 Platforms
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR_INK);
  doc.text('Analitik & Benchmark 3 Platform Media Sosial Resmi', MARGIN, 280);

  // 1. Instagram Card
  const platH = 82;
  const igY = 300;
  drawNeoBox(MARGIN, igY, CONTENT_WIDTH, platH, COLOR_WHITE);
  doc.save();
  doc.rect(MARGIN, igY, 6, platH).fill('#E1306C');
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#E1306C');
  doc.text('1. Instagram • @sumbarterkini_id', MARGIN + 16, igY + 10);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_INK);
  doc.text('31.500 Followers  |  Avg. ER: 4.8%  (Visual & Storytelling Hub)', MARGIN + 16, igY + 26);
  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_MUTED);
  doc.text('• Jangkauan per Post / Reels: 25.000 - 120.000+ akun', MARGIN + 16, igY + 42);
  doc.text('• Total Tayangan Bulanan: 1.8 Juta+ tayangan / bulan', MARGIN + 16, igY + 54);
  doc.text('• Rata-rata Story Views: 3.500 - 6.200 penonton aktif per 24 jam', MARGIN + 16, igY + 66);

  // 2. TikTok Card
  const ttY = igY + platH + 10;
  drawNeoBox(MARGIN, ttY, CONTENT_WIDTH, platH, COLOR_WHITE);
  doc.save();
  doc.rect(MARGIN, ttY, 6, platH).fill('#000000');
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000');
  doc.text('2. TikTok • @sumbarterkini_id', MARGIN + 16, ttY + 10);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_INK);
  doc.text('86.200 Followers  |  Avg. ER: 7.4%  (Algoritma Viral & FYP)', MARGIN + 16, ttY + 26);
  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_MUTED);
  doc.text('• Video Views Organik: 45.000 - 500.000+ views (sering FYP nasional)', MARGIN + 16, ttY + 42);
  doc.text('• Total Tayangan Bulanan: 4.5 Juta+ tayangan / bulan', MARGIN + 16, ttY + 54);
  doc.text('• Rata-rata Shares & Saves: 800 - 3.500+ interaksi per video viral', MARGIN + 16, ttY + 66);

  // 3. Facebook Card
  const fbY = ttY + platH + 10;
  drawNeoBox(MARGIN, fbY, CONTENT_WIDTH, platH, COLOR_WHITE);
  doc.save();
  doc.rect(MARGIN, fbY, 6, platH).fill('#1877F2');
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#1877F2');
  doc.text('3. Facebook Page • Sumbar Terkini', MARGIN + 16, fbY + 10);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_INK);
  doc.text('212.500 Followers  |  Avg. ER: 3.9%  (Komunitas Dewasa & Perantau)', MARGIN + 16, fbY + 26);
  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_MUTED);
  doc.text('• Post Reach Organik: 65.000 - 350.000+ akun (sangat kuat usia 25-54 tahun)', MARGIN + 16, fbY + 42);
  doc.text('• Jangkauan Bulanan: 6.2 Juta+ akun terjangkau / bulan', MARGIN + 16, fbY + 54);
  doc.text('• Basis Komunitas: Kota Padang, Bukittinggi, Riau, dan perantau Jabodetabek', MARGIN + 16, fbY + 66);

  // Demographics Box
  const demoY = fbY + platH + 12;
  const demoH = 120;
  drawNeoBox(MARGIN, demoY, CONTENT_WIDTH, demoH, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_INK);
  doc.text('Persebaran Demografi & Karakteristik Audiens', MARGIN + 14, demoY + 10);

  // Two columns inside Demographics
  const colW = (CONTENT_WIDTH - 36) / 2;
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#B71C1C');
  doc.text('SEBARAN LOKASI GEOGRAFIS:', MARGIN + 14, demoY + 28);
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_INK);
  doc.text('• Sumatera Barat: 68% (Padang, Bukittinggi, Payakumbuh, Pariaman, dll)', MARGIN + 14, demoY + 42);
  doc.text('• Jabodetabek, Riau, & Perantau Minang: 24%', MARGIN + 14, demoY + 56);
  doc.text('• Wilayah Nasional Lainnya: 8%', MARGIN + 14, demoY + 70);

  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#00796B');
  doc.text('RENTANG USIA PRODUKTIF (90% Usia 18-44):', MARGIN + 14 + colW + 8, demoY + 28);
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_INK);
  doc.text('• 18 - 24 Tahun: 25% (Gen Z & Mahasiswa)', MARGIN + 14 + colW + 8, demoY + 42);
  doc.text('• 25 - 34 Tahun: 42% (Milenial Muda / Konsumen Utama)', MARGIN + 14 + colW + 8, demoY + 56);
  doc.text('• 35 - 44 Tahun: 23%  |  45+ Tahun: 10%', MARGIN + 14 + colW + 8, demoY + 70);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('Rasio Gender: Pria 52%  •  Wanita 48%  |  Daya Beli Menengah ke Atas', MARGIN + 14, demoY + 96, { width: CONTENT_WIDTH - 28, align: 'center' });

  // Page 1 Footer
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_MUTED);
  doc.text('Sumbar Terkini Official Media Kit 2026 • Halaman 1 dari 2', MARGIN, 804, { width: CONTENT_WIDTH, align: 'center' });

  // =========================================================================
  // PAGE 2: Rate Card, Terms & Contact
  // =========================================================================
  doc.addPage();
  drawPageBackground();

  // Top Free Story Alert Banner
  drawNeoBox(MARGIN, 32, CONTENT_WIDTH, 28, COLOR_MINT);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_INK);
  doc.text(
    'PROMO SPESIAL: SETIAP PASANG IKLAN OTOMATIS INCLUDE FREE 1X INSTAGRAM STORY 24 JAM',
    MARGIN,
    41,
    { width: CONTENT_WIDTH, align: 'center' }
  );

  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_INK);
  doc.text('Daftar Tarif & Paket Paid Promote Resmi 2026', MARGIN, 70);

  // 5 Packages Cards with clean spacing and NO overlaps
  const pkgH = 58;
  let currentPkgY = 88;

  // 1. Foto / Desain
  drawNeoBox(MARGIN, currentPkgY, CONTENT_WIDTH, pkgH, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_INK);
  doc.text('1. Foto / Desain (Carousel Slide)', MARGIN + 14, currentPkgY + 8);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR_INK);
  doc.text('Rp150.000', MARGIN, currentPkgY + 8, { width: CONTENT_WIDTH - 14, align: 'right' });
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('• Maksimal 10 slide di 1 platform pilihan (Instagram, TikTok, atau Facebook)', MARGIN + 14, currentPkgY + 24);
  doc.text('• Bebas fitur Collab Post resmi akun @sumbarterkini_id & tag akun bisnis Anda', MARGIN + 14, currentPkgY + 35);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#00796B');
  doc.text('• BONUS: Sudah include Free 1x Instagram Story 24 Jam dengan link stiker aktif', MARGIN + 14, currentPkgY + 46);

  // 2. Video Reels
  currentPkgY += pkgH + 8;
  drawNeoBox(MARGIN, currentPkgY, CONTENT_WIDTH, pkgH, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_INK);
  doc.text('2. Video Reels (Format 9:16)', MARGIN + 14, currentPkgY + 8);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR_INK);
  doc.text('Rp200.000', MARGIN, currentPkgY + 8, { width: CONTENT_WIDTH - 14, align: 'right' });
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('• Durasi video maksimal 3 menit di 1 platform pilihan (IG Reels, TikTok, atau FB Video)', MARGIN + 14, currentPkgY + 24);
  doc.text('• Bebas fitur Collab Post bersama @sumbarterkini_id, audio trending & caption optimal', MARGIN + 14, currentPkgY + 35);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#00796B');
  doc.text('• BONUS: Sudah include Free 1x Instagram Story 24 Jam dengan link stiker aktif', MARGIN + 14, currentPkgY + 46);

  // 3. Paket Combo Reels (Popular)
  currentPkgY += pkgH + 8;
  const comboH = 68;
  drawNeoBox(MARGIN, currentPkgY, CONTENT_WIDTH, comboH, '#FFF8E7');
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_INK);
  doc.text('3. Paket Combo Reels  [PALING LARIS / BEST SELLER]', MARGIN + 14, currentPkgY + 8);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR_INK);
  doc.text('Rp300.000', MARGIN, currentPkgY + 8, { width: CONTENT_WIDTH - 14, align: 'right' });
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_INK);
  doc.text('• Durasi maksimal 3 menit. Mirroring tayang serentak di 3 platform sekaligus: IG, TikTok, dan FB!', MARGIN + 14, currentPkgY + 24);
  doc.text('• Bebas fitur Collab Post di semua kanal. Menjangkau gabungan 330.200+ followers aktif', MARGIN + 14, currentPkgY + 36);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#B71C1C');
  doc.text('• BONUS: Sudah include Free 1x Instagram Story 24 Jam dengan link stiker aktif', MARGIN + 14, currentPkgY + 48);

  // 4. Instagram Story
  currentPkgY += comboH + 8;
  drawNeoBox(MARGIN, currentPkgY, CONTENT_WIDTH, pkgH, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_INK);
  doc.text('4. Instagram Story Standalone', MARGIN + 14, currentPkgY + 8);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR_INK);
  doc.text('Rp50.000', MARGIN, currentPkgY + 8, { width: CONTENT_WIDTH - 14, align: 'right' });
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('• Harga per 1x tayangan Story selama 24 jam penuh di akun @sumbarterkini_id', MARGIN + 14, currentPkgY + 24);
  doc.text('• Bisa mention, tag akun, dan stiker tautan langsung (link sticker ke WhatsApp / Web)', MARGIN + 14, currentPkgY + 35);
  doc.text('• Cocok untuk flash promo, pengumuman lowongan kerja, atau reminder event cepat', MARGIN + 14, currentPkgY + 46);

  // 5. Langganan Bulanan
  currentPkgY += pkgH + 8;
  const langgananH = 72;
  drawNeoBox(MARGIN, currentPkgY, CONTENT_WIDTH, langgananH, '#E8FAF4');
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_INK);
  doc.text('5. Langganan Bulanan  [BEST VALUE - HEMAT Rp600.000]', MARGIN + 14, currentPkgY + 8);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR_INK);
  doc.text('Rp600.000', MARGIN, currentPkgY + 8, { width: CONTENT_WIDTH - 14, align: 'right' });
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_INK);
  doc.text('• 4 kali penayangan sebulan (jadwal fleksibel). Setiap penayangan Mirroring di IG, TikTok, dan FB (Total 12 postingan!)', MARGIN + 14, currentPkgY + 24);
  doc.text('• Bebas pilih format per sesi: Foto / Slides / Video Reels. Bebas Collab Post di seluruh jadwal', MARGIN + 14, currentPkgY + 36);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#00796B');
  doc.text('• BONUS: Termasuk 4x Free Instagram Stories selama periode langganan bulanan', MARGIN + 14, currentPkgY + 48);

  // Terms and Conditions Box
  currentPkgY += langgananH + 10;
  const tcH = 114;
  drawNeoBox(MARGIN, currentPkgY, CONTENT_WIDTH, tcH, COLOR_WHITE);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_INK);
  doc.text('Syarat & Ketentuan Kemitraan (T&C)', MARGIN + 14, currentPkgY + 8);

  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_INK);
  doc.text('1. Ketentuan Konten: ', MARGIN + 14, currentPkgY + 24, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Tidak menerima SARA, judi online, pinjaman ilegal, atau skema penipuan. Produk obat/makanan wajib berizin BPOM/PIRT.');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('2. Materi Pengiklan: ', MARGIN + 14, currentPkgY + 40, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Materi (foto/video/caption/link) disiapkan pengiklan. Wajib dikirim maksimal H-1 via WA Dokumen atau Google Drive.');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('3. Pembayaran & Slot: ', MARGIN + 14, currentPkgY + 56, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Jadwal dikunci setelah full payment. Reschedule maksimal 1x (konfirmasi minimal H-1 / 24 jam sebelum tayang).');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('4. Penayangan: ', MARGIN + 14, currentPkgY + 72, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Story tayang 24 jam penuh; Feed/Reels dipertahankan permanen sesuai paket. Mendukung Collab Post gratis.');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('5. Batas Tanggung Jawab: ', MARGIN + 14, currentPkgY + 88, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Pengelola menyediakan ruang promosi dan tidak bertanggung jawab atas sengketa transaksi pembeli dengan pengiklan.');

  // Official Contacts Box (Bottom)
  currentPkgY += tcH + 10;
  const contactH = 82;
  drawNeoBox(MARGIN, currentPkgY, CONTENT_WIDTH, contactH, COLOR_MUSTARD);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR_INK);
  doc.text('Pemesanan Slot & Kontak Kemitraan Resmi', MARGIN + 16, currentPkgY + 10);

  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_INK);
  doc.text('• WhatsApp Pemesanan: 0896-1766-2378  (Direct Link: https://wa.me/6289617662378)', MARGIN + 16, currentPkgY + 28);
  doc.text('• Email Bisnis / Invoice: mrrobot4444@gmail.com', MARGIN + 16, currentPkgY + 42);
  doc.text('• Akun Media Sosial: Instagram & TikTok @sumbarterkini_id  •  Facebook Page: Sumbar Terkini', MARGIN + 16, currentPkgY + 56);
  doc.text('• Domisili Kantor: Padang, Sumatera Barat, Indonesia', MARGIN + 16, currentPkgY + 68);

  // Page 2 Footer
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_MUTED);
  doc.text('Sumbar Terkini Official Media Kit 2026 • Halaman 2 dari 2', MARGIN, 804, { width: CONTENT_WIDTH, align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log('✅ Clean non-overlapping Media Kit PDF successfully generated at:', outputPath);
      resolve(outputPath);
    });
    writeStream.on('error', reject);
  });
}

generateMediaKitPdf().catch(console.error);
