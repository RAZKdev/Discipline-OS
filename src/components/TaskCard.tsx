'use client';

import React, { useState } from 'react';
import { Task, TaskInstance, TaskStatus } from '@/domain/types';

interface TaskCardProps {
  task: Task;
  instance: TaskInstance;
  onUpdateStatus: (
    instanceId: string,
    status: TaskStatus,
    reason?: string,
    rescheduledDate?: string
  ) => Promise<void>;
}

export function TaskCard({ task, instance, onUpdateStatus }: TaskCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipOptions, setShowSkipOptions] = useState(false);

  const isCompleted = instance.status === 'completed';
  const isSkipped = instance.status === 'skipped';
  const isRescheduled = instance.status === 'rescheduled';

  const categoryColorMap: Record<string, string> = {
    foundation: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    workout: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    discipline: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    rest: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  };

  const categoryLabelMap: Record<string, string> = {
    foundation: 'Fondasi Rutinitas',
    workout: 'Kesehatan & Olahraga',
    discipline: 'Disiplin / Deep Work',
    rest: 'Istirahat',
  };

  const handleToggleComplete = async () => {
    setIsSubmitting(true);
    try {
      const nextStatus: TaskStatus = isCompleted ? 'pending' : 'completed';
      await onUpdateStatus(instance.id, nextStatus);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async (reason: string) => {
    setIsSubmitting(true);
    try {
      await onUpdateStatus(instance.id, 'skipped', reason);
      setShowSkipOptions(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    setIsSubmitting(true);
    try {
      // Reschedule to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      await onUpdateStatus(instance.id, 'rescheduled', undefined, tomorrowStr);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article
      className={`p-4 sm:p-5 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-[var(--surface-subtle)] border-emerald-200/80 opacity-90 dark:border-emerald-900/50'
          : isSkipped
          ? 'bg-[var(--surface-subtle)] border-stone-200 opacity-75 dark:border-stone-800'
          : isRescheduled
          ? 'bg-[var(--surface-subtle)] border-indigo-200/60 opacity-80 dark:border-indigo-900/40'
          : 'bg-[var(--surface)] border-[var(--border)] shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Accessible Checkbox Button with min 48x48px touch target */}
        <button
          type="button"
          onClick={handleToggleComplete}
          disabled={isSubmitting || isSkipped || isRescheduled}
          data-testid="task-checkbox"
          data-task-id={task.id}
          data-task-title={task.title}
          data-completed={isCompleted ? 'true' : 'false'}
          aria-label={
            isCompleted
              ? `Tandai tugas "${task.title}" belum selesai`
              : `Tandai tugas "${task.title}" selesai`
          }
          className={`flex items-center justify-center min-w-[48px] min-h-[48px] rounded-lg border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500'
              : 'border-[var(--border)] bg-transparent hover:border-emerald-500 text-transparent hover:text-emerald-500'
          } ${isSkipped || isRescheduled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <svg
            className={`w-6 h-6 stroke-[3] transition-transform ${isCompleted ? 'scale-100' : 'scale-75'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                categoryColorMap[task.category] || 'bg-stone-100 text-stone-800 border-stone-200'
              }`}
            >
              {categoryLabelMap[task.category] || task.category}
            </span>

            {task.estimatedMinutes && (
              <span className="text-xs text-[var(--text-secondary)]">
                ⏱️ {task.estimatedMinutes} menit
              </span>
            )}

            {isCompleted && (
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                ✓ Selesai
              </span>
            )}
            {isSkipped && (
              <span className="text-xs font-medium text-[var(--text-secondary)] italic">
                (Dilewatkan: {instance.skippedReason || 'Istirahat'})
              </span>
            )}
            {isRescheduled && (
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                ➜ Dijadwalkan ke esok hari ({instance.rescheduledToDate})
              </span>
            )}
          </div>

          <h3
            className={`font-semibold text-base sm:text-lg text-[var(--text-primary)] leading-snug ${
              isCompleted ? 'line-through text-[var(--text-secondary)]' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Action buttons (Skip without shame, Reschedule, or Undo) */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!isCompleted && !isSkipped && !isRescheduled && (
              <>
                <button
                  type="button"
                  onClick={() => setShowSkipOptions(!showSkipOptions)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 min-h-[36px] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] border border-[var(--border)] rounded-md transition-colors"
                >
                  Lewatkan Hari Ini
                </button>

                <button
                  type="button"
                  onClick={handleReschedule}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 min-h-[36px] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] border border-[var(--border)] rounded-md transition-colors"
                >
                  Jadwalkan ke Besok
                </button>
              </>
            )}

            {(isCompleted || isSkipped || isRescheduled) && (
              <button
                type="button"
                onClick={() => onUpdateStatus(instance.id, 'pending')}
                disabled={isSubmitting}
                className="px-3 py-1.5 min-h-[36px] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] border border-[var(--border)] rounded-md transition-colors"
              >
                ↩ Batalkan / Kembalikan
              </button>
            )}
          </div>

          {/* Neutral, non-judgmental skip options */}
          {showSkipOptions && (
            <div className="mt-2.5 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] text-xs space-y-2">
              <p className="font-medium text-[var(--text-primary)]">
                Pilih alasan (tanpa rasa bersalah):
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Energi sedang rendah / Perlu istirahat',
                  'Fokus dialihkan ke prioritas mendesak',
                  'Kondisi tubuh memerlukan jeda',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => handleSkip(reason)}
                    className="px-2.5 py-1.5 bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--text-primary)] rounded border border-[var(--border)] transition-colors min-h-[36px]"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
