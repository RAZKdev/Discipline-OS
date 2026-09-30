import { describe, it, expect, vi } from 'vitest';
import { signInWithEmail, signUpWithEmail } from '../actions';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Auth Server Actions', () => {
  it('returns validation error when sign in email or password is missing', async () => {
    const formData = new FormData();
    formData.append('email', '');
    formData.append('password', '');

    const result = await signInWithEmail(null, formData);
    expect(result.error).toBe('Email dan kata sandi wajib diisi.');
  });

  it('returns validation error when sign up password is too short', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', '123'); // < 6 chars

    const result = await signUpWithEmail(null, formData);
    expect(result.error).toBe('Kata sandi minimal harus 6 karakter.');
  });
});
