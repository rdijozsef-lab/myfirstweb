'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createSession, setSessionCookie, verifyPassword, clearSessionCookie } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');
  const nextUrl = String(formData.get('next') || '/office');

  if (!username || !password) {
    redirect(`/login?error=${encodeURIComponent('Add meg a felhasználónevet és a jelszót.')}`);
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
  });

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('Nincs ilyen felhasználó.')}`);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    redirect(`/login?error=${encodeURIComponent('Hibás jelszó.')}`);
  }

  const token = await createSession({
    sub: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  });

  await setSessionCookie(token);
  redirect(nextUrl.startsWith('/office') ? nextUrl : '/office');
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/login');
}
