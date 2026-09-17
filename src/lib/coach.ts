'use server';

import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VIEWING_ATHLETE_COOKIE } from '@/lib/session';
import { EmailAlreadyRegisteredError, MIN_PASSWORD_LENGTH, registerUser } from '@/lib/user-auth';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

const INVITE_TTL_DAYS = 14;

async function requireCoachId(): Promise<string> {
	const session = await auth();
	if (!session?.user?.id || session.user.role !== 'COACH') throw new Error('Solo un coach puede hacer esto');
	return session.user.id;
}

export async function getMyAthletes() {
	const coachId = await requireCoachId();
	return prisma.user.findMany({
		where: { coachId },
		select: { id: true, name: true, email: true, createdAt: true },
		orderBy: { createdAt: 'desc' }
	});
}

export async function getMyInvites() {
	const coachId = await requireCoachId();
	return prisma.coachInvite.findMany({
		where: { coachId, status: 'PENDING' },
		orderBy: { createdAt: 'desc' }
	});
}

export async function createInvite(email: string) {
	const coachId = await requireCoachId();
	const normalizedEmail = email.trim().toLowerCase();

	const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
	if (existingUser) throw new Error('Ya existe una cuenta con ese email');

	const token = randomBytes(24).toString('base64url');
	const invite = await prisma.coachInvite.create({
		data: {
			coachId,
			email: normalizedEmail,
			token,
			expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)
		}
	});
	return invite;
}

export async function cancelInvite(id: string) {
	const coachId = await requireCoachId();
	await prisma.coachInvite.delete({ where: { id, coachId } });
}

export async function startViewingAthlete(athleteId: string) {
	const coachId = await requireCoachId();
	const athlete = await prisma.user.findFirst({ where: { id: athleteId, coachId }, select: { id: true } });
	if (!athlete) throw new Error('Ese alumno no te pertenece');

	(await cookies()).set(VIEWING_ATHLETE_COOKIE, athlete.id, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 30
	});
	redirect('/panel');
}

export async function stopViewingAthlete() {
	(await cookies()).delete(VIEWING_ATHLETE_COOKIE);
	redirect('/coach');
}

export async function getViewingAthlete() {
	const session = await auth();
	if (session?.user?.role !== 'COACH') return null;
	const viewingId = (await cookies()).get(VIEWING_ATHLETE_COOKIE)?.value;
	if (!viewingId) return null;
	return prisma.user.findFirst({ where: { id: viewingId, coachId: session.user.id }, select: { id: true, name: true } });
}

export async function getInviteByToken(token: string) {
	const invite = await prisma.coachInvite.findUnique({
		where: { token },
		include: { coach: { select: { name: true, email: true } } }
	});
	if (!invite || invite.status !== 'PENDING' || invite.expiresAt < new Date()) return null;
	return invite;
}

export async function acceptInvite(params: { token: string; password: string; name?: string }) {
	const invite = await getInviteByToken(params.token);
	if (!invite) return { error: 'Esta invitación ya no es válida' };

	if (params.password.length < MIN_PASSWORD_LENGTH) {
		return { error: `Elegí una contraseña de al menos ${MIN_PASSWORD_LENGTH} caracteres` };
	}

	let user;
	try {
		user = await registerUser({
			email: invite.email,
			password: params.password,
			name: params.name,
			role: 'ATHLETE',
			coachId: invite.coachId
		});
	} catch (error) {
		if (error instanceof EmailAlreadyRegisteredError) return { error: error.message };
		throw error;
	}

	await prisma.coachInvite.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } });

	let destination: string;
	try {
		destination = await signIn('credentials', {
			email: user.email,
			password: params.password,
			redirect: false,
			redirectTo: '/panel'
		});
	} catch (error) {
		if (error instanceof AuthError) return { error: 'Cuenta creada, pero no se pudo iniciar sesión. Entrá manualmente.' };
		throw error;
	}

	redirect(new URL(destination, 'http://localhost').pathname || '/panel');
}
