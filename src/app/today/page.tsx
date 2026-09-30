'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { EntertainmentGateBanner } from '@/components/EntertainmentGateBanner';
import { TaskCard } from '@/components/TaskCard';
import { NewTaskModal } from '@/components/NewTaskModal';
import { getTaskRepository } from '@/infrastructure/repositories';
import { Task, TaskInstance, Streak, EntertainmentRule, TaskStatus, CategoryType } from '@/domain/types';

export default function TodayPage() {
  const repo = useMemo(() => getTaskRepository(), []);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [instances, setInstances] = useState<TaskInstance[]>([]);
  const [streak, setStreak] = useState<Streak | undefined>();
  const [entertainmentRule, setEntertainmentRule] = useState<EntertainmentRule | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const loadData = async () => {
    try {
      const [fetchedTasks, fetchedInstances, fetchedStreak, fetchedRule] = await Promise.all([
        repo.getTasks(),
        repo.getTaskInstances(todayStr),
        repo.getStreak('user-demo'),
        repo.getEntertainmentRule('user-demo'),
      ]);
      setTasks(fetchedTasks);
      setInstances(fetchedInstances);
      setStreak(fetchedStreak);
      setEntertainmentRule(fetchedRule);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (
    instanceId: string,
    status: TaskStatus,
    reason?: string,
    rescheduledDate?: string
  ) => {
    const { instance, updatedStreak } = await repo.updateTaskInstanceStatus(
      instanceId,
      status,
      reason,
      rescheduledDate
    );

    setInstances((prev) => prev.map((item) => (item.id === instance.id ? instance : item)));
    if (updatedStreak) {
      setStreak(updatedStreak);
    }

    if (status === 'completed') {
      showTemporaryFeedback('Tugas berhasil diselesaikan! Langkah baik untuk konsistensi.');
    } else if (status === 'skipped') {
      showTemporaryFeedback('Tugas dilewatkan dengan tenang tanpa penalti.');
    } else if (status === 'rescheduled') {
      showTemporaryFeedback('Tugas dijadwalkan ulang ke esok hari.');
    }
  };

  const handleToggleStreakPause = async () => {
    if (!streak) return;
    const nextPaused = !streak.isPaused;
    const updated = await repo.setStreakPaused('user-demo', nextPaused);
    setStreak(updated);
    showTemporaryFeedback(
      nextPaused
        ? 'Streak dijeda. Anda dapat beristirahat tanpa khawatir kehilangan rekor konsistensi.'
        : 'Streak kembali aktif.'
    );
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    await repo.createTask(taskData);
    await loadData();
    showTemporaryFeedback('Tugas baru berhasil ditambahkan ke jadwal hari ini.');
  };

  const showTemporaryFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  const completedCount = useMemo(() => {
    return instances.filter((i) => i.status === 'completed').length;
  }, [instances]);

  const taskInstancePairs = useMemo(() => {
    return instances
      .map((inst) => {
        const task = tasks.find((t) => t.id === inst.taskId);
        return { task, instance: inst };
      })
      .filter((pair): pair is { task: Task; instance: TaskInstance } => pair.task !== undefined);
  }, [instances, tasks]);

  const filteredPairs = useMemo(() => {
    if (filterCategory === 'all') return taskInstancePairs;
    if (filterCategory === 'completed') {
      return taskInstancePairs.filter((p) => p.instance.status === 'completed');
    }
    return taskInstancePairs.filter((p) => p.task.category === filterCategory);
  }, [taskInstancePairs, filterCategory]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col transition-colors">
      <Navbar streak={streak} onToggleStreakPause={handleToggleStreakPause} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header & Date */}
        <section aria-label="Ringkasan Hari Ini" className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-semibold tracking-wider text-[var(--accent-foundation)] uppercase">
                Konsistensi Harian
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Rutinitas Hari Ini
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Fokus bertahap: Fondasi → Olahraga → Disiplin tanpa rasa bersalah.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 min-h-[48px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <span aria-hidden="true" className="text-lg leading-none">+</span>
              <span>Tambah Tugas</span>
            </button>
          </div>
        </section>

        {/* Temporary Feedback Notification */}
        {feedbackMessage && (
          <div
            role="status"
            className="p-3.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 text-sm font-medium flex items-center justify-between transition-all"
          >
            <span>{feedbackMessage}</span>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="ml-3 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 min-h-[36px] px-2 text-xs font-bold"
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </div>
        )}

        {/* Entertainment Gate Banner */}
        {entertainmentRule && (
          <EntertainmentGateBanner
            rule={entertainmentRule}
            completedTasksCount={completedCount}
          />
        )}

        {/* Category Filters */}
        <section aria-label="Penyaring Kategori" className="flex items-center space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Semua Tugas' },
            { id: 'foundation', label: 'Fondasi' },
            { id: 'workout', label: 'Olahraga' },
            { id: 'discipline', label: 'Disiplin' },
            { id: 'completed', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                filterCategory === tab.id
                  ? 'bg-[var(--text-primary)] text-[var(--background)] border-[var(--text-primary)]'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface-subtle)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Task List / States */}
        {isLoading ? (
          <div className="space-y-4 py-8" aria-label="Memuat data tugas...">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] animate-pulse"
              />
            ))}
          </div>
        ) : filteredPairs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 mx-auto flex items-center justify-center text-xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {filterCategory === 'all'
                ? 'Tidak ada tugas yang dijadwalkan'
                : 'Tidak ada tugas pada kategori ini'}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Semua tugas telah tuntas atau Anda dapat menambahkan rutinitas baru untuk hari ini.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 inline-flex items-center px-4 py-2 min-h-[44px] rounded-lg text-xs font-semibold bg-[var(--surface-subtle)] hover:bg-[var(--border)] text-[var(--text-primary)] border border-[var(--border)] transition-colors"
            >
              + Tambah Tugas Baru
            </button>
          </div>
        ) : (
          <div className="space-y-3" role="feed" aria-label="Daftar tugas hari ini">
            {filteredPairs.map(({ task, instance }) => (
              <TaskCard
                key={instance.id}
                task={task}
                instance={instance}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal Tambah Tugas */}
      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
