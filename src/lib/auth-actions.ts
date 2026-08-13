'use server';

import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/lib/auth';

export async function signInWithPassword(password: string, callbackUrl?: string) {
	try {
		await signIn('credentials', { password, redirectTo: callbackUrl ?? '/panel' });
	} catch (error) {
		if (error instanceof AuthError) {
			return { error: 'Contraseña incorrecta' };
		}
		throw error;
	}
}

export async function signOutAction() {
	await signOut({ redirectTo: '/' });
}
