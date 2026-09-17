import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const VIEWING_ATHLETE_COOKIE = 'viewingAthleteId';

/**
 * Returns the ID of the user whose data should be read/written by the
 * current request: normally the logged-in user, but if a COACH is
 * currently "viewing as" one of their athletes (see coach.ts), that
 * athlete's ID instead — so every existing screen (splits, mesocycles,
 * entrenar, progreso) works unchanged for a coach acting on a client's
 * behalf, with no per-function coach-awareness needed.
 */
export async function requireUserId(): Promise<string> {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error('No autenticado');
	}

	if (session.user.role === 'COACH') {
		const viewingId = (await cookies()).get(VIEWING_ATHLETE_COOKIE)?.value;
		if (viewingId) {
			const athlete = await prisma.user.findFirst({ where: { id: viewingId, coachId: session.user.id } });
			if (athlete) return athlete.id;
		}
	}

	return session.user.id;
}
