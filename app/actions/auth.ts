'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(
  prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;

  if (
    username !== process.env.APP_USERNAME ||
    password !== process.env.APP_PASSWORD
  ) {
    return 'Username atau password salah.';
  }

  const cookieStore = await cookies();
  cookieStore.set('auth_token', process.env.SESSION_SECRET!, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  redirect('/');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}
