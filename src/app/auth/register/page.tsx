'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { signUpWithEmail, AuthActionResult } from '../actions';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    signUpWithEmail,
    null
  );

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xl font-bold tracking-tight text-[var(--text-primary)] hover:opacity-90 rounded-md px-2 py-1 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          <span className="w-7 h-7 rounded-lg bg-[var(--accent-foundation)] flex items-center justify-center text-white text-sm font-black">
            D
          </span>
          <span>Discipline-OS</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Buat Akun Konsistensi
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Mulai kebiasaan bertahap yang bebas dari rasa malu dan eskalasi berbahaya.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--surface)] py-8 px-6 shadow-md border border-[var(--border)] rounded-2xl sm:px-10">
          {state?.error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 text-red-900 border border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900 text-sm font-medium"
            >
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Nama Lengkap / Panggilan
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center px-4 py-3 min-h-[48px] rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {isPending ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[var(--text-secondary)] space-y-2 border-t border-[var(--border)] pt-4">
            <p>
              Sudah memiliki akun?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Masuk ke akun
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
