const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generateMediaKitPdf() {
  const outputPath = path.join(__dirname, '../public/media-kit-sumbar-terkini.pdf');
  const logoPath = path.join(__dirname, '../public/logo-sumbar-terkini.png');

  // Exact A4 Dimensions in points
  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN_LEFT = 24;
  const MARGIN_RIGHT = 24;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 547.28

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 20, bottom: 20, left: MARGIN_LEFT, right: MARGIN_RIGHT },
    bufferPages: true,
    autoFirstPage: true,
    info: {
      Title: 'Sumbar Terkini Official Media Kit & Rate Card 2026',
      Author: 'Sumbar Terkini Digital Media Network',
      Subject: 'Paid Promote, Endorsement & Advertising Rate Card',
      Keywords: 'Media Kit, Sumbar Terkini, Padang, Sumatera Barat, Rate Card, Paid Promote, Instagram, TikTok, Facebook',
    },
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Design Tokens - Neo-Brutalist Soft Palette (Strictly Anti-Slop Compliant)
  const COLOR_INK = '#1E1E1E';
  const COLOR_PAPER = '#FAF8F5';
  const COLOR_WHITE = '#FFFFFF';
  const COLOR_MUSTARD = '#FFD166';
  const COLOR_MINT = '#06D6A0';
  const COLOR_CORAL = '#EF476F';
  const COLOR_CRIMSON = '#B71C1C';
  const COLOR_MUTED = '#4A4A4A';
  const COLOR_SUBTLE = '#666666';

  // Helper for drawing full-page background
  function drawBackground() {
    doc.save();
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLOR_PAPER);
    doc.restore();
  }

  // Helper for Neo-Brutalist Rounded Box with solid border and crisp offset shadow
  function drawNeoCard(x, y, w, h, bgColor = COLOR_WHITE, borderColor = COLOR_INK, shadowOffset = 2.5, radius = 6) {
    doc.save();
    if (shadowOffset > 0) {
      doc.roundedRect(x + shadowOffset, y + shadowOffset, w, h, radius).fill(COLOR_INK);
    }
    doc.roundedRect(x, y, w, h, radius).fillAndStroke(bgColor, borderColor).lineWidth(1.5);
    doc.restore();
  }

  // =========================================================================
  // PAGE 1: Brand Profile, Social Media Metrics & Demographics
  // =========================================================================
  drawBackground();

  // 1. Top Accent Announcement Bar
  drawNeoCard(MARGIN_LEFT, 22, CONTENT_WIDTH, 24, COLOR_MUSTARD, COLOR_INK, 2, 4);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_INK);
  doc.text(
    'SUMBAR TERKINI • MEDIA KIT & PAID PROMOTE RESMI 2026 • 330.200+ TOTAL AUDIENS AKTIF',
    MARGIN_LEFT,
    30,
    { width: CONTENT_WIDTH, align: 'center', lineBreak: false }
  );

  // 2. Editorial Hero Card
  drawNeoCard(MARGIN_LEFT, 52, CONTENT_WIDTH, 114, COLOR_WHITE, COLOR_INK, 3, 8);
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, MARGIN_LEFT + 14, 64, { width: 90, height: 90 });
  }

  const heroTextX = MARGIN_LEFT + 118;
  const heroTextWidth = CONTENT_WIDTH - 132;

  // Badge Category
  doc.save();
  doc.roundedRect(heroTextX, 62, 230, 15, 3).fillAndStroke('#FFEBEF', '#EF476F').lineWidth(1);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#B71C1C');
  doc.text('PORTAL BERITA & VIRAL MEDIA SUMATERA BARAT', heroTextX + 6, 66, { lineBreak: false });
  doc.restore();

  // Brand Name
  doc.font('Helvetica-Bold').fontSize(20).fillColor(COLOR_INK);
  doc.text('SUMBAR TERKINI', heroTextX, 81, { lineBreak: false });

  // Tagline
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#B71C1C');
  doc.text('Suara Terdepan Informasi, Politik & Berita Viral Sumatera Barat dan Nasional', heroTextX, 104, { lineBreak: false });

  // Handle & Location Meta
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_MUTED);
  doc.text('@sumbarterkini_id  •  Kota Padang, Sumatera Barat  •  3 Official Social Channels', heroTextX, 118, { lineBreak: false });

  // Bio Description
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_INK);
  doc.text(
    'Media informasi digital terkemuka di Sumatera Barat yang menyajikan berita terkini, analisis isu politik, kebijakan publik, dan peristiwa viral di Sumatera Barat & Indonesia secara cepat, tajam, dan terpercaya. Menjangkau jutaan audiens Minangkabau di ranah dan perantauan.',
    heroTextX,
    130,
    { width: heroTextWidth, lineGap: 1.8 }
  );

  // 3. Three Key Metrics Summary Cards
  const statCardW = (CONTENT_WIDTH - 16) / 3;
  const statY = 174;
  const statH = 54;

  // Stat Card 1: Total Followers
  drawNeoCard(MARGIN_LEFT, statY, statCardW, statH, '#FFF9E6', COLOR_INK, 2, 6);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#7A5800');
  doc.text('TOTAL AUDIENS AKTIF', MARGIN_LEFT + 10, statY + 7, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(15).fillColor(COLOR_INK);
  doc.text('330.200+ Akun', MARGIN_LEFT + 10, statY + 20, { lineBreak: false });
  doc.font('Helvetica').fontSize(7).fillColor(COLOR_MUTED);
  doc.text('IG (31.5K) • TikTok (86.2K) • FB (212.5K)', MARGIN_LEFT + 10, statY + 38, { lineBreak: false });

  // Stat Card 2: Monthly Reach
  drawNeoCard(MARGIN_LEFT + statCardW + 8, statY, statCardW, statH, '#E6FBF3', COLOR_INK, 2, 6);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#007A55');
  doc.text('JANGKAUAN BULANAN', MARGIN_LEFT + statCardW + 18, statY + 7, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(15).fillColor(COLOR_INK);
  doc.text('12.5 Juta+ Views', MARGIN_LEFT + statCardW + 18, statY + 20, { lineBreak: false });
  doc.font('Helvetica').fontSize(7).fillColor(COLOR_MUTED);
  doc.text('Akumulasi tayangan lintas 3 platform resmi', MARGIN_LEFT + statCardW + 18, statY + 38, { lineBreak: false });

  // Stat Card 3: Free Story Guarantee
  drawNeoCard(MARGIN_LEFT + (statCardW + 8) * 2, statY, statCardW, statH, '#FFEBF0', COLOR_INK, 2, 6);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#B71C1C');
  doc.text('GARANSI KONTEN', MARGIN_LEFT + (statCardW + 8) * 2 + 10, statY + 7, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(13.5).fillColor(COLOR_INK);
  doc.text('FREE INSTASTORY', MARGIN_LEFT + (statCardW + 8) * 2 + 10, statY + 20, { lineBreak: false });
  doc.font('Helvetica').fontSize(7).fillColor(COLOR_MUTED);
  doc.text('Sudah include di setiap paket iklan', MARGIN_LEFT + (statCardW + 8) * 2 + 10, statY + 38, { lineBreak: false });

  // 4. Section Heading: Platforms
  doc.font('Helvetica-Bold').fontSize(11.5).fillColor(COLOR_INK);
  doc.text('Jangkauan & Analitik 3 Platform Media Sosial Resmi', MARGIN_LEFT, 237, { lineBreak: false });

  // 5. Platform 1: Instagram
  const platH = 76;
  const igY = 252;
  drawNeoCard(MARGIN_LEFT, igY, CONTENT_WIDTH, platH, '#FFF9FA', COLOR_INK, 2.5, 6);
  doc.save();
  doc.roundedRect(MARGIN_LEFT, igY, 7, platH, 3).fill('#E1306C');
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#E1306C');
  doc.text('1. INSTAGRAM • @sumbarterkini_id', MARGIN_LEFT + 16, igY + 9, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_INK);
  doc.text('31.500 Followers  •  Avg. Engagement Rate: 4.8%  (Visual & Storytelling Hub)', MARGIN_LEFT + 16, igY + 23, { lineBreak: false });
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('• Jangkauan per Post / Reels: 25.000 - 120.000+ akun per konten tayang', MARGIN_LEFT + 16, igY + 37, { lineBreak: false });
  doc.text('• Total Impresi Bulanan: 1.8 Juta+ tayangan / bulan', MARGIN_LEFT + 16, igY + 49, { lineBreak: false });
  doc.text('• Rata-rata Story Views: 3.500 - 6.200 penonton aktif per 24 jam (Free Repost Promosi)', MARGIN_LEFT + 16, igY + 61, { lineBreak: false });

  // 6. Platform 2: TikTok
  const ttY = igY + platH + 8;
  drawNeoCard(MARGIN_LEFT, ttY, CONTENT_WIDTH, platH, '#F8FAFC', COLOR_INK, 2.5, 6);
  doc.save();
  doc.roundedRect(MARGIN_LEFT, ttY, 7, platH, 3).fill('#111111');
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#111111');
  doc.text('2. TIKTOK • @sumbarterkini_id', MARGIN_LEFT + 16, ttY + 9, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_INK);
  doc.text('86.200 Followers  •  Avg. Engagement Rate: 7.4%  (Algoritma Viral & FYP)', MARGIN_LEFT + 16, ttY + 23, { lineBreak: false });
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('• Video Views Organik: 45.000 - 500.000+ views (sering masuk FYP regional & nasional)', MARGIN_LEFT + 16, ttY + 37, { lineBreak: false });
  doc.text('• Total Impresi Bulanan: 4.5 Juta+ tayangan / bulan', MARGIN_LEFT + 16, ttY + 49, { lineBreak: false });
  doc.text('• Rata-rata Interaksi Viral: 800 - 3.500+ shares & saves per video', MARGIN_LEFT + 16, ttY + 61, { lineBreak: false });

  // 7. Platform 3: Facebook
  const fbY = ttY + platH + 8;
  drawNeoCard(MARGIN_LEFT, fbY, CONTENT_WIDTH, platH, '#F4F8FD', COLOR_INK, 2.5, 6);
  doc.save();
  doc.roundedRect(MARGIN_LEFT, fbY, 7, platH, 3).fill('#1877F2');
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#1877F2');
  doc.text('3. FACEBOOK PAGE • Sumbar Terkini', MARGIN_LEFT + 16, fbY + 9, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_INK);
  doc.text('212.500 Followers  •  Avg. Engagement Rate: 3.9%  (Komunitas Dewasa & Perantau)', MARGIN_LEFT + 16, fbY + 23, { lineBreak: false });
  doc.font('Helvetica').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('• Post Reach Organik: 65.000 - 350.000+ akun (sangat kuat demografi usia 25-54 tahun)', MARGIN_LEFT + 16, fbY + 37, { lineBreak: false });
  doc.text('• Total Jangkauan Bulanan: 6.2 Juta+ akun terjangkau / bulan', MARGIN_LEFT + 16, fbY + 49, { lineBreak: false });
  doc.text('• Basis Komunitas Utama: Kota Padang, Bukittinggi, Payakumbuh, Riau, dan perantau Minang', MARGIN_LEFT + 16, fbY + 61, { lineBreak: false });

  // 8. Demographics Box
  const demoY = fbY + platH + 10;
  const demoH = 116;
  drawNeoCard(MARGIN_LEFT, demoY, CONTENT_WIDTH, demoH, COLOR_WHITE, COLOR_INK, 2.5, 6);

  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_INK);
  doc.text('Demografi & Karakteristik Audiens Sumbar Terkini', MARGIN_LEFT + 14, demoY + 9, { lineBreak: false });

  const colW = (CONTENT_WIDTH - 36) / 2;
  // Left Column (Geography)
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#B71C1C');
  doc.text('SEBARAN LOKASI GEOGRAFIS:', MARGIN_LEFT + 14, demoY + 26, { lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_INK);
  doc.text('• Sumatera Barat: 68% (Padang, Bukittinggi, Payakumbuh, Pariaman, Solok, dll)', MARGIN_LEFT + 14, demoY + 39, { lineBreak: false });
  doc.text('• Jabodetabek, Riau, & Jaringan Perantau Minang: 24%', MARGIN_LEFT + 14, demoY + 52, { lineBreak: false });
  doc.text('• Wilayah Nasional Lainnya: 8%', MARGIN_LEFT + 14, demoY + 65, { lineBreak: false });

  // Right Column (Age)
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#00796B');
  doc.text('RENTANG USIA PRODUKTIF (90% Usia 18-44):', MARGIN_LEFT + 14 + colW + 8, demoY + 26, { lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_INK);
  doc.text('• 18 - 24 Tahun: 25% (Gen Z & Mahasiswa Aktif)', MARGIN_LEFT + 14 + colW + 8, demoY + 39, { lineBreak: false });
  doc.text('• 25 - 34 Tahun: 42% (Milenial Muda / Konsumen Utama)', MARGIN_LEFT + 14 + colW + 8, demoY + 52, { lineBreak: false });
  doc.text('• 35 - 44 Tahun: 23%  |  45+ Tahun: 10%', MARGIN_LEFT + 14 + colW + 8, demoY + 65, { lineBreak: false });

  // Bottom Demographics Bar
  doc.save();
  doc.roundedRect(MARGIN_LEFT + 12, demoY + 84, CONTENT_WIDTH - 24, 22, 3).fill('#F9FAFB');
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_MUTED);
  doc.text(
    'Rasio Gender: Pria 52% • Wanita 48%   |   Daya Beli: Menengah ke Atas   |   Traffic: 100% Organik & Viral',
    MARGIN_LEFT + 12,
    demoY + 91,
    { width: CONTENT_WIDTH - 24, align: 'center', lineBreak: false }
  );
  doc.restore();

  // Page 1 Footer Text
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_SUBTLE);
  doc.text('Sumbar Terkini Official Media Kit 2026 • Halaman 1 dari 2', MARGIN_LEFT, 796, {
    width: CONTENT_WIDTH,
    align: 'center',
    lineBreak: false,
  });

  // =========================================================================
  // PAGE 2: Rate Card, Free Story Guarantee, T&C & Official Contacts
  // =========================================================================
  doc.addPage();
  drawBackground();

  // 1. Top Free Story Guarantee Alert Banner
  drawNeoCard(MARGIN_LEFT, 22, CONTENT_WIDTH, 26, COLOR_MINT, COLOR_INK, 2, 4);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_INK);
  doc.text(
    'PROMO SPESIAL: SETIAP PASANG IKLAN OTOMATIS INCLUDE FREE 1X INSTAGRAM STORY 24 JAM',
    MARGIN_LEFT,
    30,
    { width: CONTENT_WIDTH, align: 'center', lineBreak: false }
  );

  // 2. Section Heading
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR_INK);
  doc.text('Daftar Tarif & Paket Paid Promote Resmi 2026', MARGIN_LEFT, 54, { lineBreak: false });

  // 3. Five Rate Card Packages
  let pkgY = 70;
  const standardPkgH = 54;

  // Package 1: Foto / Desain
  drawNeoCard(MARGIN_LEFT, pkgY, CONTENT_WIDTH, standardPkgH, COLOR_WHITE, COLOR_INK, 2, 5);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_INK);
  doc.text('1. Foto / Desain (Carousel Slide)', MARGIN_LEFT + 12, pkgY + 7, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(11.5).fillColor(COLOR_INK);
  doc.text('Rp150.000', MARGIN_LEFT, pkgY + 7, { width: CONTENT_WIDTH - 12, align: 'right', lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_MUTED);
  doc.text('• Maksimal 10 slide di 1 platform pilihan (Instagram, TikTok, atau Facebook)', MARGIN_LEFT + 12, pkgY + 21, { lineBreak: false });
  doc.text('• Bebas fitur Collab Post bersama akun @sumbarterkini_id & tag akun bisnis Anda', MARGIN_LEFT + 12, pkgY + 31, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#00796B');
  doc.text('• BONUS: Sudah include Free 1x Instagram Story 24 Jam dengan link stiker aktif', MARGIN_LEFT + 12, pkgY + 41, { lineBreak: false });

  // Package 2: Video Reels
  pkgY += standardPkgH + 6;
  drawNeoCard(MARGIN_LEFT, pkgY, CONTENT_WIDTH, standardPkgH, COLOR_WHITE, COLOR_INK, 2, 5);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_INK);
  doc.text('2. Video Reels (Format 9:16)', MARGIN_LEFT + 12, pkgY + 7, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(11.5).fillColor(COLOR_INK);
  doc.text('Rp200.000', MARGIN_LEFT, pkgY + 7, { width: CONTENT_WIDTH - 12, align: 'right', lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_MUTED);
  doc.text('• Durasi video maksimal 3 menit di 1 platform pilihan (IG Reels, TikTok, atau FB Video)', MARGIN_LEFT + 12, pkgY + 21, { lineBreak: false });
  doc.text('• Bebas fitur Collab Post bersama @sumbarterkini_id, audio trending & caption optimal', MARGIN_LEFT + 12, pkgY + 31, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#00796B');
  doc.text('• BONUS: Sudah include Free 1x Instagram Story 24 Jam dengan link stiker aktif', MARGIN_LEFT + 12, pkgY + 41, { lineBreak: false });

  // Package 3: Paket Combo Reels (Best Seller)
  pkgY += standardPkgH + 6;
  const comboH = 64;
  drawNeoCard(MARGIN_LEFT, pkgY, CONTENT_WIDTH, comboH, '#FFF9E8', COLOR_INK, 2.5, 6);
  doc.save();
  doc.roundedRect(MARGIN_LEFT, pkgY, CONTENT_WIDTH, 4, 2).fill(COLOR_CRIMSON);
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLOR_INK);
  doc.text('3. Paket Combo Reels  [PALING LARIS / BEST SELLER]', MARGIN_LEFT + 12, pkgY + 9, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(12.5).fillColor(COLOR_INK);
  doc.text('Rp300.000', MARGIN_LEFT, pkgY + 9, { width: CONTENT_WIDTH - 12, align: 'right', lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_INK);
  doc.text('• Durasi maksimal 3 menit. Mirroring tayang serentak di 3 platform sekaligus: IG, TikTok, dan FB!', MARGIN_LEFT + 12, pkgY + 24, { lineBreak: false });
  doc.text('• Bebas fitur Collab Post di semua kanal. Menjangkau gabungan 330.200+ followers aktif', MARGIN_LEFT + 12, pkgY + 36, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#B71C1C');
  doc.text('• BONUS: Sudah include Free 1x Instagram Story 24 Jam dengan link stiker aktif', MARGIN_LEFT + 12, pkgY + 48, { lineBreak: false });

  // Package 4: Instagram Story Standalone
  pkgY += comboH + 6;
  const storyPkgH = 50;
  drawNeoCard(MARGIN_LEFT, pkgY, CONTENT_WIDTH, storyPkgH, COLOR_WHITE, COLOR_INK, 2, 5);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_INK);
  doc.text('4. Instagram Story Standalone', MARGIN_LEFT + 12, pkgY + 7, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(11.5).fillColor(COLOR_INK);
  doc.text('Rp50.000', MARGIN_LEFT, pkgY + 7, { width: CONTENT_WIDTH - 12, align: 'right', lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_MUTED);
  doc.text('• Harga per 1x tayangan Story selama 24 jam penuh di akun resmi @sumbarterkini_id', MARGIN_LEFT + 12, pkgY + 21, { lineBreak: false });
  doc.text('• Bisa mention, tag akun, dan stiker tautan langsung (link sticker ke WhatsApp / Website)', MARGIN_LEFT + 12, pkgY + 33, { lineBreak: false });

  // Package 5: Langganan Bulanan (Best Value)
  pkgY += storyPkgH + 6;
  const monthlyPkgH = 66;
  drawNeoCard(MARGIN_LEFT, pkgY, CONTENT_WIDTH, monthlyPkgH, '#EBFBF5', COLOR_INK, 2.5, 6);
  doc.save();
  doc.roundedRect(MARGIN_LEFT, pkgY, CONTENT_WIDTH, 4, 2).fill('#00796B');
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLOR_INK);
  doc.text('5. Langganan Bulanan  [BEST VALUE - HEMAT Rp600.000]', MARGIN_LEFT + 12, pkgY + 9, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(12.5).fillColor(COLOR_INK);
  doc.text('Rp600.000', MARGIN_LEFT, pkgY + 9, { width: CONTENT_WIDTH - 12, align: 'right', lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_INK);
  doc.text('• 4 kali penayangan sebulan (jadwal fleksibel). Setiap tayang Mirroring di IG, TikTok & FB (Total 12 konten!)', MARGIN_LEFT + 12, pkgY + 24, { lineBreak: false });
  doc.text('• Bebas pilih format per sesi: Foto / Slides / Video Reels. Bebas Collab Post di seluruh jadwal', MARGIN_LEFT + 12, pkgY + 36, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#00796B');
  doc.text('• BONUS: Termasuk 4x Free Instagram Stories selama periode langganan bulanan', MARGIN_LEFT + 12, pkgY + 48, { lineBreak: false });

  // 4. Terms and Conditions Box
  pkgY += monthlyPkgH + 8;
  const tcH = 104;
  drawNeoCard(MARGIN_LEFT, pkgY, CONTENT_WIDTH, tcH, COLOR_WHITE, COLOR_INK, 2, 6);

  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_INK);
  doc.text('Syarat & Ketentuan Kemitraan Iklan (T&C)', MARGIN_LEFT + 12, pkgY + 8, { lineBreak: false });

  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLOR_INK);
  doc.text('1. Ketentuan Konten: ', MARGIN_LEFT + 12, pkgY + 22, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Tidak menerima SARA, judi online, pinjaman ilegal, atau skema penipuan. Produk farmasi/makanan wajib izin BPOM/PIRT.');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('2. Materi Pengiklan: ', MARGIN_LEFT + 12, pkgY + 36, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Materi siap unggah (foto/video/caption/link). Wajib dikirim maksimal H-1 via WhatsApp Dokumen atau Google Drive.');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('3. Pembayaran & Slot: ', MARGIN_LEFT + 12, pkgY + 50, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Jadwal dikunci setelah full payment. Reschedule maksimal 1x (konfirmasi minimal H-1 / 24 jam sebelum tayang).');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('4. Penayangan & Collab: ', MARGIN_LEFT + 12, pkgY + 64, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Story tayang 24 jam; Feed/Reels dipertahankan permanen sesuai paket. Mendukung Collab Post gratis.');

  doc.font('Helvetica-Bold').fillColor(COLOR_INK).text('5. Batas Tanggung Jawab: ', MARGIN_LEFT + 12, pkgY + 78, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_MUTED).text('Pengelola menyediakan ruang promosi dan tidak bertanggung jawab atas sengketa transaksi pembeli dengan pengiklan.');

  // 5. Official Contacts Box (Bottom)
  pkgY += tcH + 8;
  const contactH = 82;
  drawNeoCard(MARGIN_LEFT, pkgY, CONTENT_WIDTH, contactH, COLOR_MUSTARD, COLOR_INK, 2.5, 6);

  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_INK);
  doc.text('Saluran Kontak Resmi & Pemesanan Slot', MARGIN_LEFT + 14, pkgY + 9, { lineBreak: false });

  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_INK);
  doc.text('• WhatsApp Pemesanan: 0896-1766-2378  (Chat Langsung: https://wa.me/6289617662378)', MARGIN_LEFT + 14, pkgY + 25, { lineBreak: false });
  doc.text('• Email Bisnis / Invoice: mrrobot4444@gmail.com', MARGIN_LEFT + 14, pkgY + 39, { lineBreak: false });
  doc.text('• Akun Media Sosial Resmi: Instagram & TikTok @sumbarterkini_id  •  Facebook Page: Sumbar Terkini', MARGIN_LEFT + 14, pkgY + 53, { lineBreak: false });
  doc.text('• Domisili Kantor: Kota Padang, Sumatera Barat, Indonesia', MARGIN_LEFT + 14, pkgY + 66, { lineBreak: false });

  // Page 2 Footer Text
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_SUBTLE);
  doc.text('Sumbar Terkini Official Media Kit 2026 • Halaman 2 dari 2', MARGIN_LEFT, 796, {
    width: CONTENT_WIDTH,
    align: 'center',
    lineBreak: false,
  });

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      // Verify page count from output
      const generatedPdf = fs.readFileSync(outputPath, 'latin1');
      const pageMatches = generatedPdf.match(/\/Type\s*\/Page\b/g);
      const pageCount = pageMatches ? pageMatches.length : 0;
      console.log(`✅ Media Kit PDF generated successfully: ${pageCount} pages (Output: ${outputPath})`);
      if (pageCount !== 2) {
        reject(new Error(`PDF Page Count assertion failed: Expected exactly 2 pages, got ${pageCount}`));
      } else {
        resolve(outputPath);
      }
    });
    writeStream.on('error', reject);
  });
}

generateMediaKitPdf().catch((err) => {
  console.error('❌ Error generating Media Kit PDF:', err);
  process.exit(1);
});
