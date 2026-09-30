'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSideClient } from '@/infrastructure/supabase/server';

export interface AuthActionResult {
  error?: string;
  success?: boolean;
}

export async function signInWithEmail(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const next = (formData.get('next') as string) || '/today';

  if (!email || !password) {
    return { error: 'Email dan kata sandi wajib diisi.' };
  }

  const supabase = await createServerSideClient();
  if (!supabase) {
    // Demo mode: allow simulation
    redirect(next);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect(next);
}

export async function signUpWithEmail(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = (formData.get('displayName') as string) || '';

  if (!email || !password) {
    return { error: 'Email dan kata sandi wajib diisi.' };
  }

  if (password.length < 6) {
    return { error: 'Kata sandi minimal harus 6 karakter.' };
  }

  const supabase = await createServerSideClient();
  if (!supabase) {
    // Demo mode
    redirect('/today');
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/today');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSideClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}
