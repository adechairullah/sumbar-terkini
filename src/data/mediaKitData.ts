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
      secondaryMetricValue: '68% Wilayah Sumbar & Perantau',
      color: '#1877F2',
      badge: 'Komunitas & Publik',
      description: 'Halaman berita dengan basis pembaca loyal dan jangkauan luas di kalangan perantau Minangkabau dan pembuat kebijakan.',
    },
  ] as PlatformMetric[],

  demographics: {
    locations: [
      { name: 'Sumatera Barat (Padang, Bukittinggi, Payakumbuh, Pariaman, Solok, dll)', percentage: 68, color: '#FFD166' },
      { name: 'Jabodetabek, Riau, & Perantau Minang Nusantara', percentage: 24, color: '#06D6A0' },
      { name: 'Nasional Lainnya', percentage: 8, color: '#EF476F' },
    ],
    ageGroups: [
      { range: '18-24', percentage: 25, color: '#FFD166' },
      { range: '25-34', percentage: 42, color: '#06D6A0' },
      { range: '35-44', percentage: 23, color: '#EF476F' },
      { range: '45+', percentage: 10, color: '#1877F2' },
    ],
    gender: { male: 52, female: 48 },
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
        'Maksimal 10 slide di 1 platform pilihan (IG, TikTok, atau FB)',
        'Bebas fitur Collab Post & tag akun tanpa biaya tambahan',
        'Penempatan Feed Permanen & Interaksi Organik',
        'BONUS: Termasuk Free 1x Instagram Story (24 Jam Penuh)',
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
        'Durasi maksimal 3 menit di 1 platform pilihan (IG, TikTok, atau FB)',
        'Bebas fitur Collab Post & tag akun',
        'Audio trending & penempatan prime time',
        'BONUS: Termasuk Free 1x Instagram Story (24 Jam Penuh)',
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
        'Durasi maksimal 3 menit High Definition',
        'Mirroring tayang serentak di 3 platform: IG, TikTok, dan FB',
        'Bebas fitur Collab Post di seluruh platform',
        'Jangkauan gabungan 330.200+ followers aktif',
        'BONUS: Termasuk Free 1x Instagram Story (24 Jam Penuh)',
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
        'Harga per tayangan selama 24 jam penuh di Instagram Story',
        'Bisa mention, tag akun, dan stiker tautan (link ke WhatsApp/Web)',
        'Jangkauan harian 3.500 - 6.200 penonton aktif',
        'Cocok untuk flash promo, link pendaftaran, & reminder event',
      ],
      note: 'Hanya dipilih jika Anda khusus ingin pasang iklan di Instagram Story saja.',
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
        '4 kali tayang dalam sebulan (Jadwal Fleksibel)',
        'Mirroring di IG, TikTok, dan FB untuk setiap tayangan (Total 12 postingan)',
        'Bebas pilih format: Foto / Slides / Reels',
        'Bebas fitur Collab Post di semua penayangan',
        'Hemat Rp600.000 dibanding memesan satuan',
        'BONUS: Termasuk 4x Free Instagram Stories selama periode langganan',
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
      format: 'Video Reels + Story',
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
      platformBadge: '3 Platform Serentak',
      category: 'Fashion & UMKM',
      viewsOrReach: '185K',
      viewsOrReachLabel: 'Total Akun Jangkauan',
      likes: '8.9K Likes',
      secondaryStat: '2.4K Klik Link',
      secondaryStatLabel: 'Interaksi & Trafik',
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
        'Tidak menerima iklan unsur SARA, pornografi, judi online, pinjaman ilegal, skema penipuan, atau barang terlarang.',
        'Produk kecantikan, obat, atau makanan wajib berizin edar jelas (BPOM/PIRT) tanpa klaim palsu.',
        'Pengelola berhak menolak materi yang melanggar pedoman komunitas.',
      ],
    },
    {
      id: 'tc-materi',
      title: '2. Materi & Teknis Pengiriman File',
      iconName: 'FileText',
      points: [
        'Materi (foto, video, caption, link, tag) siap unggah dari pengiklan.',
        'Mendukung Collab Post gratis.',
        'Wajib dikirim maksimal H-1 via WhatsApp Document (089617662378), Google Drive, atau Email (mrrobot4444@gmail.com) agar kualitas terjaga.',
        'Materi yang sudah tayang sesuai kesepakatan tidak dapat diubah kecuali kesalahan pengelola.',
      ],
    },
    {
      id: 'tc-pembayaran',
      title: '3. Pembayaran & Penjadwalan Tayang',
      iconName: 'CreditCard',
      points: [
        'Jadwal dikunci setelah full payment (konfirmasi ke WA 089617662378).',
        'Reschedule maksimal 1 kali (konfirmasi H-1 / 24 jam sebelum tayang).',
        'Pembatalan sepihak bersifat non-refundable.',
      ],
    },
    {
      id: 'tc-tanggungjawab',
      title: '4. Penayangan & Batas Tanggung Jawab',
      iconName: 'Clock',
      points: [
        'Story tayang 24 jam penuh; Feed/Reels/TikTok dipertahankan sesuai paket.',
        'Jika ada kendala teknis dari pengelola, berhak jadwal pengganti atau refund penuh.',
        'Pengelola hanya menyediakan ruang promosi dan tidak bertanggung jawab atas target penjualan atau sengketa transaksi.',
      ],
    },
  ] as TermSection[],
};
