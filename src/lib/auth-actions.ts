'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { EmailAlreadyRegisteredError, MIN_PASSWORD_LENGTH, registerUser } from '@/lib/user-auth';
import { signIn, signOut } from '@/lib/auth';

function safeTarget(callbackUrl?: string): string {
	// Only same-site paths, so a crafted callback can't turn sign in into an
	// open redirect.
	return callbackUrl?.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : '/panel';
}

async function signInAndRedirect(email: string, password: string, target: string) {
	let destination: string;
	try {
		// `redirect: false` keeps Auth.js from navigating to its own error
		// endpoint on a failed sign in, which renders a raw JSON response
		// instead of showing the problem inside the dialog.
		destination = await signIn('credentials', { email, password, redirect: false, redirectTo: target });
	} catch (error) {
		if (error instanceof AuthError) return { error: 'No se pudo iniciar sesión, probá de nuevo' };
		throw error;
	}

	const resolved = new URL(destination, 'http://localhost');
	const failure = resolved.searchParams.get('error');
	if (failure === 'CredentialsSignin') return { error: 'Email o contraseña incorrectos' };
	// Any other error, or a destination still pointing at the Auth.js endpoints,
	// means the sign in never completed: surface it inside the dialog rather
	// than bouncing the browser onto Auth.js' own error response.
	if (failure || resolved.pathname.startsWith('/api/auth/')) {
		return { error: 'No se pudo iniciar sesión, probá de nuevo' };
	}

	redirect(target);
}

export async function signInWithPassword(email: string, password: string, callbackUrl?: string) {
	return signInAndRedirect(email, password, safeTarget(callbackUrl));
}

export async function registerAndSignIn(params: {
	email: string;
	password: string;
	name?: string;
	role: 'COACH' | 'ATHLETE';
	callbackUrl?: string;
}) {
	if (params.password.length < MIN_PASSWORD_LENGTH) {
		return { error: `Elegí una contraseña de al menos ${MIN_PASSWORD_LENGTH} caracteres` };
	}

	try {
		await registerUser({ email: params.email, password: params.password, name: params.name, role: params.role });
	} catch (error) {
		if (error instanceof EmailAlreadyRegisteredError) return { error: error.message };
		throw error;
	}

	return signInAndRedirect(params.email, params.password, safeTarget(params.callbackUrl));
}

export async function signOutAction() {
	await signOut({ redirectTo: '/' });
}
