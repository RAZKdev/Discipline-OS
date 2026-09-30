'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CategoryType, TaskPriority } from '@/domain/types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description?: string;
    category: CategoryType;
    priority: TaskPriority;
    estimatedMinutes: number;
    userId: string;
  }) => Promise<void>;
}

export function NewTaskModal({ isOpen, onClose, onSubmit }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('discipline');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleInputRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul tugas wajib diisi.');
      return;
    }
    if (estimatedMinutes <= 0) {
      setError('Estimasi durasi harus lebih dari 0 menit.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        estimatedMinutes: Number(estimatedMinutes),
        userId: 'user-demo',
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch {
      setError('Gagal menyimpan tugas. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
    >
      <div
        className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden p-6 sm:p-7 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <h2 id="modal-title" className="text-xl font-bold text-[var(--text-primary)]">
            Tambah Tugas Konsistensi
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela tambah tugas"
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-lg bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 text-sm border border-red-200 dark:border-red-900"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Judul Tugas <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Baca buku 15 halaman / Review tugas"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="task-desc" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Deskripsi Singkat (Opsional)
            </label>
            <textarea
              id="task-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan catatan singkat atau target spesifik..."
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="task-category" className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                Kategori
              </label>
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm"
              >
                <option value="foundation">Fondasi</option>
                <option value="workout">Olahraga</option>
                <option value="discipline">Disiplin / Fokus</option>
                <option value="rest">Istirahat</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                Prioritas
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-duration" className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                Durasi (Menit)
              </label>
              <input
                id="task-duration"
                type="number"
                min="1"
                max="480"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[48px] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] border border-[var(--border)] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 min-h-[48px] rounded-lg text-sm font-semibold bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs transition-colors"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
