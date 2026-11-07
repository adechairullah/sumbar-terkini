# 🌶️ Sumbar Terkini - Media Kit & Endorsement Hub (2026)

Official Media Kit & Creator Endorsement Hub interaktif untuk **Sumbar Terkini** (Platform Media Digital & Amplifikasi Brand #1 di Sumatera Barat).

Dibangun dengan arsitektur **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, dan filosofi desain **Playful Neo-Brutalism Soft** (WCAG AA Contrast Compliant, Warm Paper `#FAF8F5`, Dark Ink `#1E1E1E`, Hard Shadows).

---

## ✨ Fitur Unggulan

1. **Neo-Brutalist Hero & Identitas Kreator**
   - Verified Badge Creator Minang, editorial bio, indikator ketersediaan slot dinamis.
   - **Creator Trust Radar:** Jaminan 3 pilar keamanan (100% Organik, 2x Revisi, Laporan H+3) & Radar Niche (Kuliner, Fashion, Gadget, Wisata).
   - **Live Audience Pulse:** Reaksi langsung penonton (🔥 Hype, 🚀 FYP, ❤️ Love) dengan *speedometer community energy* dan semburan partikel *framer-motion*.
   - **Widget Interaktif Creator Hub:** Prediktor Skor Potensi FYP, High-Five Realtime ke Tim Kreator, dan Cek Kesiapan Slot.

2. **Multi-Platform Bento Grid**
   - Metrik 5 platform resmi: Instagram, TikTok, YouTube, Facebook, dan X.
   - Visualisasi rolling odometer, Engagement Rate (ER), dan distribusi demografi audiens Minang & Perantauan.

3. **Dynamic Rate Card & Paket Endorsement**
   - Kalkulator tarif interaktif (Single Platform vs Multi-Platform Bundle).
   - Direct WhatsApp quote generator dengan pesan pre-filled rapi.

4. **Portofolio Kolaborasi Viral**
   - Showcase kampanye brand lokal & nasional, filter kategori industri, dan metrik performa nyata.

5. **Full Editor Admin CMS (`/admin`)**
   - Antarmuka manajemen lengkap tanpa login gate publik (akses via URL `/admin`).
   - Kustomisasi profil, logo, banner pengumuman, menu navigasi, tarif endorsement, dan urutan platform sosial media.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15.5](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) dengan palet kustom Neo-Brutalis
- **Motion & Sound:** [Framer Motion](https://www.framer.com/motion/) & Web Audio Synthesizer
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data Access Layer:** Hybrid Data Layer dengan Resilient Mock Fallback (siap jalan tanpa koneksi eksternal) dan dukungan [Supabase PostgreSQL](https://supabase.com/).
- **Quality Assurance:** 4-Tier Automated E2E Suite, Unit Tests, dan Adversarial Stress Suite (100% Passing).

---

## 🚀 Memulai (Lokal)

```bash
# 1. Clone repository
git clone https://github.com/adechairullah/sumbar-terkini.git
cd sumbar-terkini

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada peramban Anda.
Panel admin dapat diakses di [http://localhost:3000/admin](http://localhost:3000/admin).

---

## ☁️ Deploy ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/new).
2. Pilih **Import Git Repository** dan pilih `adechairullah/sumbar-terkini`.
3. Biarkan pengaturan build default:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
4. Klik **Deploy**.
5. Project langsung aktif dengan zero-config fallback bawaan!
