import { auth } from '@/lib/auth';

/** Devuelve el ID del usuario autenticado o lanza un error si no hay sesión. */
export async function requireUserId(): Promise<string> {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error('No autenticado');
	}
	return session.user.id;
}
