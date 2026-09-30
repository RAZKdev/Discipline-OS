'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { getTaskRepository } from '@/infrastructure/repositories';
import { Reward, EntertainmentRule, Streak, UserPreference } from '@/domain/types';
import {
  requestNotificationPermission,
  sendBrowserNotification,
} from '@/infrastructure/notifications/browser-notification';

export default function RewardsPage() {
  const repo = useMemo(() => getTaskRepository(), []);

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [entertainmentRule, setEntertainmentRule] = useState<EntertainmentRule | null>(null);
  const [streak, setStreak] = useState<Streak | undefined>();
  const [preference, setPreference] = useState<UserPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal custom reward
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'entertainment' | 'rest' | 'treat' | 'personal'>('rest');
  const [newCost, setNewCost] = useState(25);

  const loadData = async () => {
    try {
      const [rws, pts, rule, strk, pref] = await Promise.all([
        repo.getRewards('user-demo'),
        repo.getPointsBalance('user-demo'),
        repo.getEntertainmentRule('user-demo'),
        repo.getStreak('user-demo'),
        repo.getUserPreference('user-demo'),
      ]);
      setRewards(rws);
      setPointsBalance(pts);
      setEntertainmentRule(rule);
      setStreak(strk);
      setPreference(pref);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [repo]);

  const handleRedeem = async (rewardId: string) => {
    setIsProcessing(true);
    try {
      const { reward, newPointsBalance } = await repo.redeemReward('user-demo', rewardId);
      setPointsBalance(newPointsBalance);
      setRewards((prev) => prev.map((r) => (r.id === reward.id ? reward : r)));
      setFeedback(`Selamat! Hadiah "${reward.title}" berhasil ditukarkan. Nikmati waktu istirahat Anda.`);
    } catch (err: any) {
      setFeedback(err.message || 'Gagal menukarkan hadiah.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlockGate = async () => {
    setIsProcessing(true);
    try {
      const updated = await repo.unlockEntertainmentGate('user-demo', 60);
      setEntertainmentRule(updated);
      setFeedback('Akses Gerbang Hiburan dibuka selama 60 menit! Nikmati waktu luang dengan tenang.');
    } catch (err: any) {
      setFeedback(err.message || 'Gagal membuka akses gerbang.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestNotification = async () => {
    if (!preference) return;
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') {
      setFeedback('Izin notifikasi browser belum diberikan atau diblokir.');
      return;
    }

    const res = sendBrowserNotification(
      'Discipline-OS: Pengingat Santai',
      'Saatnya istirahat atau lanjutkan blok fokus harian Anda.',
      preference
    );

    if (res.sent) {
      setFeedback('Notifikasi pengingat berhasil dikirimkan ke browser Anda.');
    } else {
      setFeedback(res.reason || 'Notifikasi tidak dapat dikirim.');
    }
  };

  const handleCreateCustomReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsProcessing(true);
    try {
      await repo.createReward({
        userId: 'user-demo',
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        category: newCategory,
        costPoints: Number(newCost),
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      await loadData();
      setFeedback('Hadiah kustom baru berhasil ditambahkan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isGateUnlocked = useMemo(() => {
    if (!entertainmentRule?.unlockedUntil) return false;
    return new Date(entertainmentRule.unlockedUntil) > new Date();
  }, [entertainmentRule]);

  const categoryColorMap: Record<string, string> = {
    entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200',
    rest: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200',
    treat: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200',
    personal: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200',
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col transition-colors">
      <Navbar streak={streak} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <section aria-label="Ringkasan Poin" className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-semibold tracking-wider text-[var(--accent-rewards)] uppercase">
                Reinforcement Positif
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Hadiah & Gerbang Hiburan
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Kumpulkan poin dari tugas yang tuntas untuk menikmati waktu luang tanpa rasa bersalah.
              </p>
            </div>

            {/* Points Balance Badge */}
            <div className="flex items-center space-x-3 bg-[var(--surface)] p-3 rounded-2xl border border-[var(--border)] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center text-xl font-bold">
                ⭐
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Saldo Poin</p>
                <p data-testid="points-balance" className="text-xl font-black text-[var(--text-primary)]">{pointsBalance} Poin</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Alert */}
        {feedback && (
          <div
            role="status"
            data-testid="feedback-alert"
            className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 text-sm font-medium flex items-center justify-between"
          >
            <span>{feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs font-bold px-2 py-1 min-h-[36px]"
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </div>
        )}

        {/* Entertainment Gate Section */}
        {entertainmentRule && (
          <section
            aria-labelledby="gate-title"
            className={`p-5 sm:p-6 rounded-2xl border transition-all ${
              isGateUnlocked
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-100'
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    data-testid="gate-status-text"
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isGateUnlocked
                        ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100'
                    }`}
                  >
                    {isGateUnlocked ? '🔓 Gerbang Terbuka' : '🔒 Gerbang Terkunci'}
                  </span>
                  <h2 id="gate-title" className="text-lg font-bold">
                    Gerbang Hiburan: {entertainmentRule.platformName}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  {isGateUnlocked ? (
                    <span>
                      Akses santai aktif hingga:{' '}
                      <strong>{new Date(entertainmentRule.unlockedUntil!).toLocaleTimeString('id-ID')}</strong>.
                      Nikmati istirahat Anda!
                    </span>
                  ) : (
                    <span>
                      Selesaikan minimal {entertainmentRule.requiredCompletedTasks} tugas harian atau gunakan poin
                      untuk membuka akses waktu santai.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  data-testid="btn-unlock-gate"
                  onClick={handleUnlockGate}
                  disabled={isProcessing}
                  className="px-4 py-2.5 min-h-[48px] rounded-xl text-xs sm:text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  {isGateUnlocked ? 'Perpanjang 60 Menit' : 'Buka Akses 60 Menit'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Browser Notification Test Bar */}
        <section
          aria-labelledby="notif-title"
          className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm"
        >
          <div className="space-y-0.5">
            <h3 id="notif-title" className="font-bold text-[var(--text-primary)]">
              Pengingat Notifikasi Browser
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Uji pengiriman notifikasi dengan kepatuhan jam tenang (Quiet Hours:{' '}
              {preference?.quietHoursStart || '21:00'} - {preference?.quietHoursEnd || '07:00'}).
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestNotification}
            className="px-4 py-2 min-h-[44px] rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            🔔 Uji Notifikasi
          </button>
        </section>

        {/* Rewards Catalog */}
        <section aria-labelledby="catalog-title" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="catalog-title" className="text-xl font-bold text-[var(--text-primary)]">
              Katalog Hadiah Konsistensi
            </h2>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold px-3.5 py-2 min-h-[40px] rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] border border-[var(--border)] transition-colors"
            >
              + Buat Hadiah Personal
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const canAfford = pointsBalance >= reward.costPoints;
                return (
                  <article
                    key={reward.id}
                    data-testid={`reward-card-${reward.id}`}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      reward.isRedeemed
                        ? 'bg-[var(--surface-subtle)] border-emerald-200/60 opacity-80'
                        : 'bg-[var(--surface)] border-[var(--border)] shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                            categoryColorMap[reward.category] || 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {reward.category.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                          ⭐ {reward.costPoints} Poin
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-[var(--text-primary)]">{reward.title}</h3>
                      {reward.description && (
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {reward.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                      {reward.isRedeemed ? (
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          ✓ Telah Ditukarkan ({reward.redeemedAt?.split('T')[0]})
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--text-secondary)]">
                          {canAfford ? 'Poin mencukupi' : `Kurang ${reward.costPoints - pointsBalance} poin`}
                        </span>
                      )}

                      <button
                        type="button"
                        data-testid={`btn-redeem-${reward.id}`}
                        onClick={() => handleRedeem(reward.id)}
                        disabled={reward.isRedeemed || !canAfford || isProcessing}
                        className={`px-4 py-2.5 min-h-[48px] rounded-lg text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                          reward.isRedeemed
                            ? 'bg-transparent text-stone-400 cursor-not-allowed'
                            : canAfford
                            ? 'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer shadow-xs'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        {reward.isRedeemed ? 'Sudah Ditukar' : 'Tukar Hadiah'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modal Custom Reward */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-reward-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 id="modal-reward-title" className="text-lg font-bold text-[var(--text-primary)]">
                Buat Hadiah Personal
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="min-h-[40px] px-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomReward} className="space-y-4">
              <div>
                <label htmlFor="reward-title" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Nama Hadiah <span className="text-red-500">*</span>
                </label>
                <input
                  id="reward-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Beli Kopi Susu / Jalan-jalan Sore"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm"
                />
              </div>

              <div>
                <label htmlFor="reward-desc" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Keterangan Singkat
                </label>
                <textarea
                  id="reward-desc"
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Catatan santai mengenai hadiah ini..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reward-category" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Kategori
                  </label>
                  <select
                    id="reward-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm"
                  >
                    <option value="rest">Istirahat</option>
                    <option value="entertainment">Hiburan</option>
                    <option value="treat">Makanan / Minuman</option>
                    <option value="personal">Hobi Personal</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="reward-cost" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Biaya Poin
                  </label>
                  <input
                    id="reward-cost"
                    type="number"
                    min="5"
                    max="500"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 min-h-[44px] rounded-lg text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 min-h-[44px] rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs"
                >
                  Simpan Hadiah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
