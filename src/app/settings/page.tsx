'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { getTaskRepository } from '@/infrastructure/repositories';
import { UserPreference, Streak, ThemePreference } from '@/domain/types';

export default function SettingsPage() {
  const repo = useMemo(() => getTaskRepository(), []);

  const [preference, setPreference] = useState<UserPreference | null>(null);
  const [streak, setStreak] = useState<Streak | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [pref, strk] = await Promise.all([
          repo.getUserPreference('user-demo'),
          repo.getStreak('user-demo'),
        ]);
        setPreference(pref);
        setStreak(strk);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [repo]);

  // Apply theme to document element
  const applyTheme = (theme: ThemePreference) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleUpdatePreference = async (changes: Partial<UserPreference>) => {
    if (!preference) return;
    setIsSaving(true);
    try {
      const updated = await repo.updateUserPreference(preference.userId, changes);
      setPreference(updated);

      if (changes.theme) {
        applyTheme(changes.theme);
      }

      setStatusMessage('Preferensi berhasil disimpan.');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch {
      setStatusMessage('Gagal menyimpan preferensi. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col transition-colors">
      <Navbar streak={streak} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <header className="space-y-1">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[var(--accent-foundation)] uppercase">
            Kontrol & Privasi
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Pengaturan & Preferensi
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Sesuaikan pengalaman sistem agar selaras dengan ritme dan kenyamanan Anda.
          </p>
        </header>

        {statusMessage && (
          <div
            role="status"
            className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 text-sm font-medium flex items-center justify-between"
          >
            <span>{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-xs font-bold px-2 py-1 min-h-[36px]"
              aria-label="Tutup notifikasi status"
            >
              ✕
            </button>
          </div>
        )}

        {isLoading || !preference ? (
          <div className="space-y-4 py-8" aria-label="Memuat pengaturan...">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Pengaturan Mode Tema */}
            <section
              aria-labelledby="theme-title"
              className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-4"
            >
              <div>
                <h2 id="theme-title" className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  Mode Tampilan Visual
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  Pilih nuansa tampilan yang nyaman bagi mata Anda saat beraktivitas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'system', label: 'Mengikuti Sistem', icon: '💻' },
                  { id: 'light', label: 'Mode Terang', icon: '☀️' },
                  { id: 'dark', label: 'Mode Gelap', icon: '🌙' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleUpdatePreference({ theme: item.id as ThemePreference })}
                    disabled={isSaving}
                    className={`flex items-center space-x-3 p-3.5 rounded-xl border min-h-[48px] text-left transition-all ${
                      preference.theme === item.id
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-200'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                    }`}
                  >
                    <span className="text-lg" aria-hidden="true">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 2. Saklar Streak Beretika (Opsional) */}
            <section
              aria-labelledby="streak-pref-title"
              className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span aria-hidden="true" className="text-base">🌿</span>
                    <h2 id="streak-pref-title" className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                      Pelacakan Rekor Konsistensi (Streak)
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Fitur *streak* di Discipline-OS sepenuhnya opsional. Mematikan fitur ini akan
                    menyembunyikan seluruh indikator hari beruntun agar Anda dapat berfokus pada
                    kebiasaan nyata tanpa tekanan psikologis atau rasa bersalah saat terputus.
                  </p>
                </div>

                <label htmlFor="streak-toggle" className="relative inline-flex items-center cursor-pointer min-h-[48px] min-w-[48px]">
                  <input
                    id="streak-toggle"
                    data-testid="streak-toggle"
                    type="checkbox"
                    checked={preference.streakEnabled}
                    onChange={(e) => handleUpdatePreference({ streakEnabled: e.target.checked })}
                    disabled={isSaving}
                    className="sr-only peer"
                    aria-label="Aktifkan pelacakan streak"
                  />
                  <div className="w-12 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[4px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </section>

            {/* 3. Aksesibilitas: Reduced Motion */}
            <section
              aria-labelledby="motion-pref-title"
              className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span aria-hidden="true" className="text-base">♿</span>
                    <h2 id="motion-pref-title" className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                      Pengurangan Gerakan (Reduced Motion)
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Minimalkan seluruh transisi visual dan animasi UI untuk kenyamanan sensori dan aksesibilitas.
                  </p>
                </div>

                <label htmlFor="motion-toggle" className="relative inline-flex items-center cursor-pointer min-h-[48px] min-w-[48px]">
                  <input
                    id="motion-toggle"
                    data-testid="motion-toggle"
                    type="checkbox"
                    checked={preference.reducedMotion}
                    onChange={(e) => handleUpdatePreference({ reducedMotion: e.target.checked })}
                    disabled={isSaving}
                    className="sr-only peer"
                    aria-label="Aktifkan pengurangan gerakan"
                  />
                  <div className="w-12 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[4px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </section>

            {/* 4. Jam Tenang (Quiet Hours) */}
            <section
              aria-labelledby="quiet-hours-title"
              className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-4"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span aria-hidden="true" className="text-base">🔕</span>
                  <h2 id="quiet-hours-title" className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    Jam Tenang (Quiet Hours)
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  Tentukan rentang jam istirahat di mana aplikasi tidak akan mengirimkan dorongan notifikasi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label
                    htmlFor="quiet-start"
                    className="block text-xs font-semibold text-[var(--text-primary)] mb-1"
                  >
                    Mulai Jam Tenang
                  </label>
                  <input
                    id="quiet-start"
                    type="time"
                    value={preference.quietHoursStart || '21:00'}
                    onChange={(e) => handleUpdatePreference({ quietHoursStart: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm min-h-[48px]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quiet-end"
                    className="block text-xs font-semibold text-[var(--text-primary)] mb-1"
                  >
                    Selesai Jam Tenang
                  </label>
                  <input
                    id="quiet-end"
                    type="time"
                    value={preference.quietHoursEnd || '07:00'}
                    onChange={(e) => handleUpdatePreference({ quietHoursEnd: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm min-h-[48px]"
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
