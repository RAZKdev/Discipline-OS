# Discipline-OS

> Sistem konsistensi dan rutinitas harian yang tenang, manusiawi, dan bebas rasa bersalah.

## 1. Deskripsi Proyek

**Discipline-OS** adalah aplikasi web untuk membangun kebiasaan bermakna tanpa tekanan berlebihan. Alih-alih mengejar streak panjang atau intensitas ekstrem, aplikasi ini membagi hari ke dalam ritme bertahap: **Fondasi → Olahraga & Gerak → Disiplin (Deep Work) → Gerbang Hiburan**.

Pengguna dapat menjeda atau melewati tugas dengan alasan netral, mengatur waktu istirahat, dan mematikan fitur streak sepenuhnya jika gamifikasi terasa mengganggu.

## 2. Kenapa Proyek Ini Dibuat

Banyak aplikasi produktivitas memakai mekanisme yang membuat pengguna merasa bersalah ketika gagal: grafik merah, peringatan putus streak, atau target yang terus naik. Pendekatan ini bisa memicu burnout dan membuat konsistensi jangka panjang justru sulit dipertahankan.

Discipline-OS dibuat untuk:

- **Membangun momentum dari langkah kecil** yang realistis, bukan ledakan motivasi sesaat.
- **Menghilangkan rasa bersalah:** tugas boleh dijeda atau dilewati tanpa hukuman psikologis.
- **Menjadikan istirahat sebagai hak:** akses hiburan dibuka setelah tugas esensial selesai, bukan sebagai pelarian impulsif.
- **Menjaga streak tetap opsional:** pengguna bisa mematikan gamifikasi tanpa kehilangan riwayat.
- **Menghormati kondisi pengguna:** tersedia jam tenang, pengurangan animasi, dan tema terang/gelap.

## 3. Fungsi & Fitur Utama

1. **Dashboard Hari Ini (`/today`)** — alur tugas fondasi, olahraga, dan deep work; checkbox interaktif; opsi skip tanpa rasa bersalah; penjadwalan ulang otomatis.
2. **Gerbang Hiburan (`/rewards`)** — saldo poin konsistensi, penukaran hadiah, sesi istirahat berdurasi, dan hadiah kustom.
3. **Pengaturan (`/settings`)** — tema terang/gelap/sistem, saklar streak opsional, jam tenang, dan mode reduced motion.
4. **PWA & Offline** — service worker, manifest, dan kemampuan pemasangan di desktop/mobile.
5. **Autentikasi SSR** — login, register, logout, dan sesi berbasis cookie melalui Supabase SSR; middleware melindungi rute.
6. **Fallback Lokal** — repository lokal otomatis sehingga aplikasi tetap berfungsi tanpa Supabase.
7. **Notifikasi Browser** — pengingat yang menghormati jam tenang dan preferensi pengguna.
8. **Aksesibilitas** — target sentuh yang nyaman, navigasi keyboard, dan pengurangan animasi.

## 4. Bahasa Pemrograman & Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Bahasa utama | TypeScript |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Database | PostgreSQL/Supabase dengan Row-Level Security |
| PWA | Service Worker API, Web App Manifest |
| Testing | Vitest, Playwright |

## 5. Struktur Direktori

```text
Discipline-OS/
├── src/
│   ├── app/                 # Landing, auth, today, rewards, settings
│   ├── components/          # Navbar, TaskCard, GateBanner, modal, PWA registration
│   ├── domain/              # Scheduler, streak, notifikasi, tipe domain
│   ├── infrastructure/      # Repository Supabase/local, notifikasi browser
│   └── styles/              # Design token
├── supabase/migrations/     # Skema PostgreSQL dan kebijakan RLS
├── e2e/                     # Pengujian Playwright
├── public/                  # Manifest, service worker, ikon
└── package.json
```

## 6. Cara Menjalankan

**Prasyarat:** Node.js 18.17+ (disarankan Node 20+) dan npm.

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

**Konfigurasi Supabase (opsional):**

```bash
cp .env.example .env.local
```

Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Tanpa konfigurasi ini, aplikasi memakai repository lokal.

**Build produksi:**

```bash
npm run build
npm run start
```

Repo ini **tidak** menyertakan `start.bat`; gunakan perintah di atas.

## 7. Pengujian

```bash
npm test          # Vitest
npm run test:e2e  # Playwright
```

Untuk E2E pertama kali:

```bash
npx playwright install
```

## 8. Lisensi

README lama menyebut lisensi MIT, tetapi repo ini **tidak** menyertakan berkas `LICENSE`. Karena itu, status lisensi belum dapat dianggap final. Hubungi pemilik repo sebelum menggunakan ulang kode.
