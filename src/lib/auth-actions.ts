'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { isPasswordConfigured, MIN_PASSWORD_LENGTH } from '@/lib/app-auth';
import { signIn, signOut } from '@/lib/auth';

export async function signInWithPassword(password: string, callbackUrl?: string) {
	// Only same-site paths, so a crafted callback can't turn sign in into an
	// open redirect.
	const target = callbackUrl?.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : '/panel';

	if (!(await isPasswordConfigured()) && password.length < MIN_PASSWORD_LENGTH) {
		return { error: `Elegí una contraseña de al menos ${MIN_PASSWORD_LENGTH} caracteres` };
	}

	let destination: string;
	try {
		// `redirect: false` keeps Auth.js from navigating to its own error
		// endpoint on a failed sign in, which renders a raw JSON response
		// instead of showing the problem inside the dialog.
		destination = await signIn('credentials', { password, redirect: false, redirectTo: target });
	} catch (error) {
		if (error instanceof AuthError) return { error: 'No se pudo iniciar sesión, probá de nuevo' };
		throw error;
	}

	const resolved = new URL(destination, 'http://localhost');
	const failure = resolved.searchParams.get('error');
	if (failure === 'CredentialsSignin') return { error: 'Contraseña incorrecta' };
	// Any other error, or a destination still pointing at the Auth.js endpoints,
	// means the sign in never completed: surface it inside the dialog rather
	// than bouncing the browser onto Auth.js' own error response.
	if (failure || resolved.pathname.startsWith('/api/auth/')) {
		return { error: 'No se pudo iniciar sesión, probá de nuevo' };
	}

	redirect(target);
}

export async function signOutAction() {
	await signOut({ redirectTo: '/' });
}
