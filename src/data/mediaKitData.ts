export interface PlatformMetric {
  id: 'instagram' | 'tiktok' | 'facebook';
  name: string;
  handle: string;
  url: string;
  followers: number;
  followersFormatted: string;
  er: number;
  reachRange: string;
  monthlyMetric: string;
  secondaryMetricLabel: string;
  secondaryMetricValue: string;
  color: string;
  badge: string;
  description: string;
}

export interface PricingPackage {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  badge?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  duration?: string;
  platformsSupported: 'single' | 'all';
  deliverables: string[];
  note?: string;
}

export interface PortfolioMockup {
  id: string;
  title: string;
  format: string;
  platformBadge: string;
  category: string;
  viewsOrReach: string;
  viewsOrReachLabel: string;
  likes: string;
  secondaryStat: string;
  secondaryStatLabel: string;
  imageUrl: string;
  brandTag: string;
}

export interface TermSection {
  id: string;
  title: string;
  iconName: string;
  points: string[];
}

export interface DemographicData {
  locations: { name: string; percentage: number; color: string }[];
  ageGroups: { range: string; percentage: number; color: string }[];
  gender: { male: number; female: number };
}

export const MEDIA_KIT_DATA = {
  brand: {
    name: 'Sumbar Terkini',
    tagline: 'Suara Terdepan Informasi, Politik & Berita Viral Sumatera Barat dan Nasional',
    description:
      'Media informasi digital berbasis di Sumatera Barat yang menyajikan berita terkini, analisis isu politik, kebijakan publik, serta peristiwa viral di Sumatera Barat dan Indonesia secara cepat, tajam, dan terpercaya.',
    totalFollowers: '330.200+',
    totalFollowersRaw: 330200,
    followersBadge: '330.200+ Total Followers Aktif',
    whatsappNumber: '6289617662378',
    whatsappDisplay: '0896-1766-2378',
    whatsappUrl: 'https://wa.me/6289617662378',
    email: 'mrrobot4444@gmail.com',
    location: 'Padang, Sumatera Barat',
    establishedYear: 2020,
  },

  platforms: [
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@sumbarterkini_id',
      url: 'https://www.instagram.com/sumbarterkini_id/',
      followers: 31500,
      followersFormatted: '31.500 (31,5K)',
      er: 4.8,
      reachRange: '25.000 - 120.000+ akun',
      monthlyMetric: '1.8 Juta+ tayangan / bulan',
      secondaryMetricLabel: 'Avg. Story Views (24 Jam)',
      secondaryMetricValue: '3.500 - 6.200 tayangan',
      color: '#E1306C',
      badge: 'Visual & Storytelling',
      description: 'Pusat interaksi visual dan berita foto viral dengan keterlibatan tinggi di kalangan netizen muda Minang.',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      handle: '@sumbarterkini_id',
      url: 'https://www.tiktok.com/@sumbarterkini_id',
      followers: 86200,
      followersFormatted: '86.200 (86,2K)',
      er: 7.4,
      reachRange: '45.000 - 500.000+ views',
      monthlyMetric: '4.5 Juta+ tayangan / bulan',
      secondaryMetricLabel: 'Avg. Shares & Saves / Video Viral',
      secondaryMetricValue: '800 - 3.500+ interaksi',
      color: '#00F2FE',
      badge: 'FYP & Viral Machine',
      description: 'Kanal video pendek viral dengan algoritma FYP aktif menjangkau penonton regional Sumatera Barat hingga nasional.',
    },
    {
      id: 'facebook',
      name: 'Facebook Page',
      handle: 'Sumbar Terkini',
      url: 'https://www.facebook.com/sumbarterkiniid',
      followers: 212500,
      followersFormatted: '212.500 (212,5K)',
      er: 3.9,
      reachRange: '65.000 - 350.000+ akun',
      monthlyMetric: '6.2 Juta+ jangkauan / bulan',
      secondaryMetricLabel: 'Demografi Kuat Usia 25-54 Tahun',
      secondaryMetricValue: 'Masyarakat & Komunitas Perantau Minang',
      color: '#1877F2',
      badge: 'Basis Komunitas Terbesar',
      description: 'Halaman berita rujukan utama masyarakat Sumatera Barat dan perantau Minang nusantara dengan daya beli matang.',
    },
  ] as PlatformMetric[],

  demographics: {
    locations: [
      { name: 'Sumatera Barat (Padang, Bukittinggi, Payakumbuh, Pariaman, dll)', percentage: 68, color: '#990000' },
      { name: 'Jabodetabek, Riau & Perantau Minang', percentage: 24, color: '#D97706' },
      { name: 'Nasional & Wilayah Lainnya', percentage: 8, color: '#0F172A' },
    ],
    ageGroups: [
      { range: '18 - 24 Tahun', percentage: 25, color: '#DC2626' },
      { range: '25 - 34 Tahun', percentage: 42, color: '#990000' },
      { range: '35 - 44 Tahun', percentage: 23, color: '#D97706' },
      { range: '45+ Tahun', percentage: 10, color: '#475569' },
    ],
    gender: {
      male: 52,
      female: 48,
    },
  } as DemographicData,

  packages: [
    {
      id: 'foto-desain',
      name: 'Foto / Desain',
      price: 150000,
      priceFormatted: 'Rp150.000',
      platformsSupported: 'single',
      duration: 'Feed Permanen',
      deliverables: [
        'Maksimal 10 slide dalam 1 postingan Carousel/Feed',
        'Pilih 1 platform target: Instagram, TikTok, atau Facebook',
        'Bebas fitur Collab Post resmi akun @sumbarterkini_id',
        'Bebas tag akun bisnis & cantumkan hashtag promosi',
        'Laporan performa jangkauan setelah 48 jam tayang',
      ],
      note: 'Cocok untuk poster promo, rilis produk, event flyer, dan pengumuman instansi.',
    },
    {
      id: 'video-reels',
      name: 'Video Reels',
      price: 200000,
      priceFormatted: 'Rp200.000',
      platformsSupported: 'single',
      duration: 'Maks. 3 Menit',
      deliverables: [
        'Durasi video maksimal 3 menit resolusi jernih 1080p',
        'Pilih 1 platform target: Instagram Reels, TikTok, atau Facebook Video',
        'Bebas fitur Collab Post bersama @sumbarterkini_id',
        'Bebas tag akun bisnis, audio viral, dan caption promosi',
        'Penempatan prime time jam ramai audiens Minang',
      ],
      note: 'Format terbaik untuk review kuliner, demo produk, tur properti, dan video sinematik.',
    },
    {
      id: 'combo-reels',
      name: 'Paket Combo Reels',
      price: 300000,
      priceFormatted: 'Rp300.000',
      badge: 'Paling Laris',
      isPopular: true,
      platformsSupported: 'all',
      duration: 'Maks. 3 Menit',
      deliverables: [
        'Durasi video maksimal 3 menit siap tayang',
        'Mirroring tayang serentak di 3 platform sekaligus: IG + TikTok + Facebook',
        'Bebas fitur Collab Post resmi di akun Instagram',
        'Maksimalisasi reach lintas generasi (Gen Z, Milenial, & Komunitas Dewasa)',
        'Tag akun, link di caption, dan hashtag promosi optimal',
      ],
      note: 'Paling diminati! Sekali pasang langsung membanjiri 3 platform media sosial terbesar.',
    },
    {
      id: 'ig-story',
      name: 'Instagram Story',
      price: 50000,
      priceFormatted: 'Rp50.000',
      platformsSupported: 'single',
      duration: '24 Jam Penuh',
      deliverables: [
        'Harga terjangkau per 1x tayangan Story selama 24 jam penuh',
        'Bebas mention & tag akun bisnis Anda langsung',
        'Stiker tautan (link sticker) langsung menuju WhatsApp atau Website',
        'Jangkauan cepat harian 3.500 - 6.200 penonton aktif',
      ],
      note: 'Sangat efektif untuk flash sale, pendaftaran instan, link pendaftaran, dan reminder event.',
    },
    {
      id: 'langganan-bulanan',
      name: 'Langganan Bulanan',
      price: 600000,
      priceFormatted: 'Rp600.000',
      badge: 'Best Value - Hemat Rp600.000',
      isBestValue: true,
      platformsSupported: 'all',
      duration: '4x Tayang / Bulan',
      deliverables: [
        '4 kali penayangan terjadwal rapi dalam satu bulan',
        'Setiap penayangan otomatis Mirroring di 3 platform: IG, TikTok, dan Facebook (Total 12 postingan)',
        'Bebas pilih format per sesi: Foto / Slides Carousel / Video Reels',
        'Bebas fitur Collab Post di seluruh jadwal penayangan',
        'Prioritas slot waktu penayangan prime time (pukul 12:00 atau 19:30 WIB)',
        'Hemat Rp600.000 dibanding memesan satuan berkali-kali',
      ],
      note: 'Solusi branding berkelanjutan untuk UMKM, instansi pemerintah, dan brand korporat.',
    },
  ] as PricingPackage[],

  portfolio: [
    {
      id: 'port-1',
      title: 'Grand Opening Kopi & Kuliner Minang Modern di Padang',
      format: 'Combo Reels + Collab Post',
      platformBadge: 'Instagram + TikTok + FB',
      category: 'Kuliner & F&B',
      viewsOrReach: '68.4K',
      viewsOrReachLabel: 'Views Organik',
      likes: '3.2K Likes',
      secondaryStat: '412 Shares',
      secondaryStatLabel: 'Dibagikan',
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
      brandTag: '@kopiminang.padang',
    },
    {
      id: 'port-2',
      title: 'Sosialisasi Layanan Publik & Event Pariwisata Sumatera Barat',
      format: 'Carousel 8 Slide Edukatif',
      platformBadge: 'Instagram & Facebook',
      category: 'Pariwisata & Pemda',
      viewsOrReach: '42.1K',
      viewsOrReachLabel: 'Akun Terjangkau',
      likes: '2.1K Likes',
      secondaryStat: '640 Saves',
      secondaryStatLabel: 'Tersimpan',
      imageUrl: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=600&auto=format&fit=crop&q=80',
      brandTag: '@pesonasumbar_official',
    },
    {
      id: 'port-3',
      title: 'Promo Spesial Gadget & Elektronik Store Cabang Padang',
      format: 'Video Reels + Story Link',
      platformBadge: 'Instagram & TikTok',
      category: 'Ritel & Gadget',
      viewsOrReach: '94.5K',
      viewsOrReachLabel: 'Video Views',
      likes: '4.8K Likes',
      secondaryStat: '890 Comments',
      secondaryStatLabel: 'Komentar Tanya Stok',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      brandTag: '@padang.gadgetstore',
    },
    {
      id: 'port-4',
      title: 'Brand Fashion & UMKM Lokal Go-Nasional',
      format: 'Paket Langganan Bulanan',
      platformBadge: '3 Platform Multi-Post',
      category: 'Fashion & UMKM',
      viewsOrReach: '185K',
      viewsOrReachLabel: 'Total Akun Jangkauan',
      likes: '8.9K Likes',
      secondaryStat: '2.4K Klik Link',
      secondaryStatLabel: 'Trafik Toko',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
      brandTag: '@songketminang_gallery',
    },
  ] as PortfolioMockup[],

  termsAndConditions: [
    {
      id: 'tc-produk',
      title: '1. Ketentuan Produk & Konten Iklan',
      iconName: 'ShieldCheck',
      points: [
        'Tidak menerima iklan atau promosi yang mengandung unsur SARA, pornografi, ujaran kebencian, perjudian online, pinjaman online ilegal, skema penipuan (money game/investasi bodong), atau barang/zat terlarang.',
        'Produk kesehatan, kecantikan, obat-obatan, atau makanan/minuman wajib memiliki legalitas dan izin edar resmi yang jelas (BPOM/PIRT/Halal) tanpa memberikan klaim medis berlebihan atau palsu.',
        'Pengelola Sumbar Terkini berhak secara mutlak menolak, menurunkan, atau membatalkan penayangan materi iklan yang dinilai melanggar pedoman komunitas dan norma kesopanan publik Sumatera Barat.',
      ],
    },
    {
      id: 'tc-materi',
      title: '2. Materi & Teknis Pengiriman File',
      iconName: 'FileText',
      points: [
        'Seluruh materi promosi (foto desain, video mentah/final, narasi caption, tautan link, dan username tag akun) harus disiapkan dalam kondisi siap unggah oleh pihak pengiklan.',
        'Fitur Collab Post (kolaborasi postingan di Instagram) diberikan secara gratis tanpa biaya tambahan agar postingan langsung muncul di feed pengiklan.',
        'Materi iklan wajib dikirimkan maksimal H-1 sebelum jadwal tayang melalui Dokumen WhatsApp (089617662378), Google Drive, atau Email (mrrobot4444@gmail.com) guna memastikan resolusi dan kualitas visual tidak terkompresi.',
        'Materi yang telah tayang sesuai dengan kesepakatan awal tidak dapat diubah, diedit, atau diganti, kecuali terdapat kesalahan ketik teknis dari pihak pengelola.',
      ],
    },
    {
      id: 'tc-pembayaran',
      title: '3. Pembayaran & Penjadwalan Tayang',
      iconName: 'CreditCard',
      points: [
        'Slot penayangan promosi hanya dikunci dan diamankan secara resmi setelah pembayaran penuh (full payment 100%) dan pengiklan mengirimkan bukti transfer via WhatsApp ke nomor 089617662378.',
        'Permintaan perubahan jadwal (reschedule) penayangan dapat diajukan maksimal 1 (satu) kali dengan pemberitahuan konfirmasi paling lambat H-1 (24 jam sebelum jadwal tayang asli).',
        'Pembatalan sepihak yang dilakukan oleh pihak pengiklan setelah jadwal dikunci bersifat non-refundable (uang muka/pembayaran tidak dapat dikembalikan).',
      ],
    },
    {
      id: 'tc-tanggungjawab',
      title: '4. Penayangan & Batas Tanggung Jawab',
      iconName: 'Clock',
      points: [
        'Format Instagram Story tayang aktif selama 24 jam penuh sejak waktu penayangan. Format postingan Feed, Video Reels, dan TikTok akan dipertahankan permanen sesuai ketentuan paket.',
        'Apabila terjadi kendala teknis force majeure dari pengelola yang menyebabkan keterlambatan tayang, pengiklan berhak atas penjadwalan kompensasi pengganti atau pengembalian dana penuh (full refund).',
        'Pengelola Sumbar Terkini hanya menyediakan ruang media publikasi dan tidak bertanggung jawab atas konversi angka penjualan produk, komplain konsumen pengiklan, atau sengketa transaksi antara pembeli dengan pengiklan.',
      ],
    },
  ] as TermSection[],
};

