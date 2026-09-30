import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          aria-labelledby="hero-title"
          className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 text-center space-y-6"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--accent-foundation)] shadow-xs">
            <span aria-hidden="true">🌿</span>
            <span>Sistem Konsistensi Bebas Rasa Bersalah</span>
          </div>

          <h1
            id="hero-title"
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tight max-w-3xl mx-auto leading-tight"
          >
            Konsistensi Harian yang Tenang, Terstruktur, dan Manusiawi.
          </h1>

          <p className="text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Bangun kebiasaan bermakna tanpa rasa malu (*no shame*), eskalasi intensitas ekstrem, atau obsesi *streak* yang kaku. Ciptakan ritme hidup bertahap yang berkelanjutan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/today"
              data-testid="btn-hero-today"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 min-h-[48px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-sm transition-colors dark:bg-emerald-600 dark:hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              Buka Dashboard Hari Ini →
            </Link>

            <a
              href="#alur-kerja"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 min-h-[48px] rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] border border-[var(--border)] font-semibold text-base transition-colors"
            >
              Lihat Alur Kerja
            </a>
          </div>
        </section>

        {/* 3 Pillars of Discipline-OS */}
        <section
          id="alur-kerja"
          aria-labelledby="pillars-title"
          className="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t border-[var(--border)]"
        >
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 id="pillars-title" className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Alur Konsistensi Bertahap
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              Sistem membagi hari Anda ke dalam 3 fondasi utama yang jelas, terukur, dan dapat dijeda kapan pun dibutuhkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Fondasi */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-lg font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Fondasi Rutinitas</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Awali hari dengan ketenangan: hidrasi, refleksi singkat, dan tentukan 3 prioritas esensial sebelum dunia luar mendistraksi Anda.
              </p>
            </div>

            {/* Pillar 2: Olahraga */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center text-lg font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Kesehatan & Gerak</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Peregangan atau jalan kaki 15-20 menit. Tidak ada paksaan intensitas ekstrem; yang penting tubuh Anda tetap aktif dan berenergi.
              </p>
            </div>

            {/* Pillar 3: Disiplin & Gate */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center justify-center text-lg font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Fokus & Gerbang Hiburan</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Selesaikan blok *deep work*. Akses hiburan (YouTube/game) terbuka secara otomatis setelah tugas utama Anda tuntas.
              </p>
            </div>
          </div>
        </section>

        {/* Anti-Guilt Commitment */}
        <section
          aria-labelledby="ethics-title"
          className="max-w-5xl mx-auto px-4 sm:px-6 py-12 mb-12"
        >
          <div className="p-8 sm:p-10 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-4">
            <h2 id="ethics-title" className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Etika Rekayasa: Menghargai Kehidupan Nyata
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>Fleksibel:</strong> Anda dapat menjeda (*pause*), mengubah (*edit*), melewatkan (*skip*), atau menjadwalkan ulang (*reschedule*) tanpa penalti.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>Streak Opsional:</strong> Fitur rekor dapat dinonaktifkan kapan saja dan tidak akan pernah mempermalukan pengguna saat terputus.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>Aksesibel:</strong> Navigasi keyboard penuh, kontras tinggi WCAG AA, dan dukungan *reduced-motion*.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>Privasi Pertama:</strong> Data tersimpan secara lokal dan terkontrol di tangan pengguna.
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6 text-center text-xs text-[var(--text-secondary)]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Discipline-OS. Berlandaskan prinsip rekayasa dan spesifikasi repositori.</p>
          <Link
            href="/today"
            className="hover:text-[var(--text-primary)] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded px-1.5 py-0.5"
          >
            Akses Hari Ini →
          </Link>
        </div>
      </footer>
    </div>
  );
}
