'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Streak } from '@/domain/types';
import { createClient } from '@/infrastructure/supabase/client';
import { signOutAction } from '@/app/auth/actions';
import { useLanguage } from '@/i18n/LanguageContext';

interface NavbarProps {
  streak?: Streak;
  onToggleStreakPause?: () => void;
}

interface UserProfile {
  email?: string;
  displayName?: string;
}

export function Navbar({ streak, onToggleStreakPause }: NavbarProps) {
  const pathname = usePathname();
  const { lang, toggleLang, t } = useLanguage();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUser({
            email: user.email,
            displayName: (user.user_metadata?.full_name as string) || user.email?.split('@')[0],
          });
        } else {
          setUser(null);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            email: session.user.email,
            displayName:
              (session.user.user_metadata?.full_name as string) || session.user.email?.split('@')[0],
          });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutAction();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-30 transition-colors w-full">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 sm:space-x-6 min-w-0">
          <Link
            href="/"
            aria-label={t('nav.homeAria')}
            className="flex items-center space-x-2 text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-md px-1 py-1 shrink-0"
          >
            <span className="w-7 h-7 rounded-md bg-[var(--accent-foundation)] flex items-center justify-center text-white text-xs font-black shrink-0">
              D
            </span>
            <span className="hidden sm:inline">{t('nav.brand')}</span>
          </Link>

          <nav aria-label={t('nav.mainNavAria')} className="flex items-center space-x-0.5 sm:space-x-1 overflow-x-auto no-scrollbar py-1">
            <Link
              href="/"
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                pathname === '/'
                  ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
              }`}
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/today"
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                pathname === '/today'
                  ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
              }`}
            >
              {t('nav.today')}
            </Link>
            <Link
              href="/rewards"
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                pathname === '/rewards'
                  ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
              }`}
            >
              {t('nav.rewards')}
            </Link>
            <Link
              href="/settings"
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                pathname === '/settings'
                  ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
              }`}
            >
              {t('nav.settings')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {streak && (
            <div className="hidden sm:flex items-center space-x-2">
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  streak.isPaused
                    ? 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                    : 'border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-primary)]'
                }`}
                title={
                  streak.isPaused
                    ? t('nav.streakPausedTitle')
                    : t('nav.streakActiveTitle', { count: streak.currentStreak })
                }
              >
                <span aria-hidden="true">{streak.isPaused ? '⏸️' : '🌿'}</span>
                <span>
                  {streak.isPaused ? (
                    <span>{t('nav.streakPaused', { count: streak.currentStreak })}</span>
                  ) : (
                    <span>{t('nav.streakActive', { count: streak.currentStreak })}</span>
                  )}
                </span>
              </div>

              {onToggleStreakPause && (
                <button
                  type="button"
                  onClick={onToggleStreakPause}
                  aria-label={streak.isPaused ? t('nav.resumeAria') : t('nav.pauseAria')}
                  className="text-xs px-2.5 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] border border-[var(--border)] rounded-md transition-colors min-h-[36px]"
                >
                  {streak.isPaused ? t('nav.resumeBtn') : t('nav.pauseBtn')}
                </button>
              )}
            </div>
          )}

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t('nav.langToggleAria')}
            data-testid="lang-toggle-btn"
            className="text-xs px-2.5 py-1.5 min-h-[36px] flex items-center space-x-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] border border-[var(--border)] rounded-md transition-colors font-semibold"
          >
            <span aria-hidden="true">🌐</span>
            <span className="font-bold">{t('nav.langBadge')}</span>
          </button>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center space-x-2 border-l border-[var(--border)] pl-2 sm:pl-3">
              <div
                className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-xs font-bold"
                title={user.email}
              >
                {user.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline-block text-xs font-medium text-[var(--text-primary)] max-w-[120px] truncate">
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="text-xs px-2.5 py-1.5 min-h-[36px] text-[var(--text-secondary)] hover:text-red-600 hover:bg-[var(--surface-subtle)] border border-[var(--border)] rounded-md transition-colors"
                aria-label={t('nav.logoutAria')}
              >
                {isSigningOut ? '...' : t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 border-l border-[var(--border)] pl-2 sm:pl-3">
              <Link
                href="/auth/login"
                className="text-xs font-medium px-3 py-1.5 min-h-[36px] flex items-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] border border-[var(--border)] transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/auth/register"
                className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 min-h-[36px] items-center rounded-md bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
