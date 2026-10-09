# Discipline-OS

> **Sistem Konsistensi & Rutinitas Harian yang Tenang, Manusiawi, dan Bebas Rasa Bersalah (*No Shame / Guilt-Free*).**

Discipline-OS adalah platform web modern yang dirancang untuk membantu Anda membangun kebiasaan bermakna tanpa rasa malu (*no shame*), eskalasi intensitas ekstrem yang memicu kejenuhan (*burnout*), atau obsesi kaku terhadap rekor *streak*. Sistem ini membagi hari Anda ke dalam ritme bertahap: **Fondasi → Olahraga & Gerak → Disiplin (Deep Work) → Gerbang Hiburan (Entertainment Gate)**.

---

## 🌿 Filosofi & Nilai Inti

1. **Konsistensi Bertahap (*Gentle Consistency*)**
   Membangun momentum hidup dari langkah kecil yang realistis. Mengutamakan kontinuitas jangka panjang dibandingkan ledakan motivasi sesaat.
2. **Desain Bebas Rasa Bersalah (*No-Shame Design*)**
   Anda memiliki kendali penuh untuk **menjeda (*pause*)** atau **melewati (*skip*)** tugas hari ini dengan alasan netral (misal: energi rendah, pemulihan fisik). Tidak ada pesan menyalahkan, grafik merah yang menakutkan, atau penalti psikologis.
3. **Gerbang Hiburan Beretika (*Entertainment Gate & Positive Rewards*)**
   Akses ke platform santai/hiburan (seperti YouTube atau game) dibuka secara otomatis dan berdurasi setelah tugas harian esensial Anda tuntas. Waktu istirahat dinikmati sebagai hak positif, bukan pelarian impulsif.
4. **Streak yang Manusiawi & Opsional**
   Fitur pelacakan hari beruntun (*streak*) dapat dijeda kapan saja atau bahkan **dinonaktifkan sepenuhnya** melalui menu Pengaturan tanpa menghilangkan data riwayat Anda.

---

## ✨ Fitur Utama

- **Dashboard Hari Ini (`/today`)**:
  - Alur tugas bertahap: Fondasi pagi, kebugaran tubuh, dan blok fokus mendalam (*deep work*).
  - Checkbox interaktif dengan umpan balik visual yang tenang.
  - Opsi lewati tugas damai (*skip without shame*) dan penjadwalan ulang otomatis ke esok hari.
  - Spanduk status Gerbang Hiburan (*Entertainment Gate Banner*) yang melacak progres harian secara *real-time*.
- **Katalog Hadiah & Gerbang Hiburan (`/rewards`)**:
  - Saldo poin konsistensi yang diperoleh secara deterministik dari penyelesaian tugas harian.
  - Penukaran poin untuk sesi istirahat bebas rasa bersalah (misal: 30 menit relaksasi, nonton serial, mendengarkan album favorit).
  - Tombol pembukaan akses Gerbang Hiburan berdurasi (60 menit).
  - Fitur penambahan hadiah kustom pribadi.
- **Pengaturan & Preferensi (`/settings`)**:
  - **Mode Tema Visual**: Terang (*Light*), Gelap (*Dark*), atau Mengikuti Sistem (*System*).
  - **Saklar Streak Opsional**: Dapat dimatikan seutuhnya bagi pengguna yang tidak ingin terpapar tekanan gamifikasi.
  - **Jam Tenang (*Quiet Hours*)**: Penyesuaian rentang jam istirahat agar sistem tidak mengirimkan dorongan notifikasi saat Anda beristirahat.
  - **Aksesibilitas (*Reduced Motion*)**: Mengurangi seluruh animasi dan transisi UI demi kenyamanan sensori.
- **PWA & Akses Offline**:
  - Service Worker cerdas untuk caching aset statis dan rute aplikasi.
  - Web App Manifest sehingga aplikasi dapat dipasang (*install*) di perangkat mobile (Android/iOS) maupun desktop layaknya aplikasi *native*.
- **Autentikasi Aman SSR (Supabase)**:
  - Alur Masuk (*Login*), Daftar (*Register*), dan Keluar (*Sign Out*) berbasis *cookie session* SSR yang aman via `@supabase/ssr`.
  - Middleware proteksi rute dan penyegaran sesi otomatis.
  - Profil pengguna yang tersinkronisasi di bilah navigasi (*Navbar*).

---

## 🛠️ Arsitektur & Teknologi

| Lapisan | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React Server Components (RSC) & Client Leaf Components |
| **Bahasa** | TypeScript 5 | Tipisasi statis ketat di seluruh domain & infrastruktur |
| **Styling** | Tailwind CSS 4 | Desain berbasis Design Tokens CSS Variables semantik |
| **Database** | PostgreSQL & Supabase | 15 tabel relasional dengan kebijakan Row-Level Security (RLS) granular |
| **PWA & Offline** | Service Worker API | Caching aset dan manifest aplikasi web progresif |
| **Unit Testing** | Vitest | 30 skenario pengujian unit & integrasi repositori |
| **E2E Testing** | Playwright | 19 pengujian alur penuh & audit responsif multi-viewport |

---

## 📁 Struktur Direktori

```text
discipline-os/
├── e2e/                           # Pengujian End-to-End Playwright (alur & responsif)
├── public/                        # Aset publik, ikon SVG, manifest.json, sw.js
├── src/
│   ├── app/                       # Next.js App Router (Halaman, Layout, Server Actions)
│   │   ├── auth/                  # Halaman Login, Register, Callback SSR
│   │   ├── rewards/               # Halaman Katalog Hadiah & Gerbang Hiburan
│   │   ├── settings/              # Halaman Preferensi & Jam Tenang
│   │   ├── today/                 # Dashboard Rutinitas Hari Ini
│   │   ├── globals.css            # Desain token, tema, dan gaya aksesibilitas
│   │   └── page.tsx               # Halaman Pembuka / Landing Page
│   ├── components/                # Komponen antarmuka (Navbar, TaskCard, GateBanner, Modal)
│   ├── domain/                    # Entitas domain murni, scheduler, streak, notifikasi
│   ├── infrastructure/            # Repositori Supabase SSR & LocalStorage fallback
│   └── styles/                    # Definisi konstanta token desain
├── supabase/
│   └── migrations/                # Skema relasional PostgreSQL & kebijakan RLS lengkap
├── playwright.config.ts           # Konfigurasi uji E2E Playwright
├── vitest.config.ts               # Konfigurasi uji unit & integrasi Vitest
└── package.json                   # Dependensi dan skrip proyek
```

---

## 🚀 Panduan Memulai

### 1. Prasyarat
- **Node.js** (versi 18.17+ atau 20+)
- **npm** (versi 9+)

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (Opsional untuk Supabase)
Salin contoh berkas konfigurasi lingkungan:
```bash
cp .env.example .env.local
```
Sesuaikan kredensial Supabase Anda jika ingin menyambungkan ke basis data awan:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
*(Catatan: Aplikasi memiliki fallback `LocalTaskRepository` otomatis sehingga tetap berfungsi penuh secara lokal meskipun belum tersambung ke Supabase).*

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pengujian Kualitas Kode

Discipline-OS dilengkapi dengan cakupan pengujian otomatis ganda (Unit + E2E):

- **Menjalankan Uji Unit & Integrasi (Vitest)**:
  ```bash
  npm test
  ```
  *Hasil: 30 pengujian lulus (Domain scheduler, streak, notifikasi, repositories, auth actions).*

- **Menjalankan Uji End-to-End & Responsif (Playwright)**:
  ```bash
  npm run test:e2e
  ```
  *Hasil: 19 pengujian lulus (Alur penuh Landing → Dashboard → Selesai Tugas → Buka Gerbang → Tukar Hadiah, audit Mobile 375px, Tablet 768px, Desktop 1280px, tap target $\ge 48\text{px}$, dan navigasi keyboard).*

- **Build Produksi**:
  ```bash
  npm run build
  npm run start
  ```

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT](LICENSE).
Dikembangkan untuk mendukung produktivitas yang sehat, berkelanjutan, dan penuh kesadaran.
