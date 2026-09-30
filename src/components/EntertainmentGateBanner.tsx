import React from 'react';
import Link from 'next/link';
import { EntertainmentRule } from '@/domain/types';

interface EntertainmentGateBannerProps {
  rule: EntertainmentRule;
  completedTasksCount: number;
}

export function EntertainmentGateBanner({
  rule,
  completedTasksCount,
}: EntertainmentGateBannerProps) {
  const isUnlocked = completedTasksCount >= rule.requiredCompletedTasks;
  const progressPercent = Math.min(
    100,
    Math.round((completedTasksCount / rule.requiredCompletedTasks) * 100)
  );

  return (
    <section
      aria-label="Status Gerbang Hiburan"
      data-testid="entertainment-gate-banner"
      className={`p-4 sm:p-5 rounded-xl border transition-all ${
        isUnlocked
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-100'
          : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span
              data-testid="gate-status-badge"
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                isUnlocked
                  ? 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100'
                  : 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100'
              }`}
            >
              {isUnlocked ? '🔓 Terbuka' : '🔒 Terkunci'}
            </span>
            <h2 className="font-semibold text-base sm:text-lg">{rule.title}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Akses santai ke <strong className="font-medium text-[var(--text-primary)]">{rule.platformName}</strong>:{' '}
            {isUnlocked ? (
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                Syarat terpenuhi! Nikmati waktu istirahat tanpa rasa bersalah.
              </span>
            ) : (
              <span>
                Selesaikan <strong className="font-semibold">{rule.requiredCompletedTasks} tugas</strong> prioritas
                (saat ini: <span data-testid="completed-count">{completedTasksCount}</span>/{rule.requiredCompletedTasks}).
              </span>
            )}
          </p>

          {isUnlocked && (
            <div className="pt-2">
              <Link
                href="/rewards"
                data-testid="btn-view-rewards-catalog"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 min-h-[48px] text-xs sm:text-sm font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              >
                <span>Buka Gerbang & Lihat Katalog Hadiah →</span>
              </Link>
            </div>
          )}
        </div>

        <div className="w-full sm:w-48 flex flex-col justify-center">
          <div className="flex justify-between text-xs font-medium mb-1 text-[var(--text-secondary)]">
            <span>Progres</span>
            <span data-testid="gate-progress-text">{progressPercent}%</span>
          </div>
          <div
            className="w-full bg-[var(--surface-subtle)] h-2 rounded-full overflow-hidden border border-[var(--border)]"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progres gerbang hiburan ${progressPercent}%`}
          >
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isUnlocked ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
