'use server';

import { signIn, signOut } from '@/lib/auth';

export async function signInWithProvider(provider: 'google' | 'github', callbackUrl?: string) {
	await signIn(provider, { redirectTo: callbackUrl ?? '/panel' });
}

export async function signOutAction() {
	await signOut({ redirectTo: '/' });
}
