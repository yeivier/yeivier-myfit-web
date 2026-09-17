import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { prisma } from '@/lib/prisma';
import type { Role } from '@prisma/client';

const scryptAsync = promisify(scrypt);

export const MIN_PASSWORD_LENGTH = 6;

async function derive(password: string, salt: string): Promise<string> {
	const derived = (await scryptAsync(password.normalize('NFKC'), salt, 64)) as Buffer;
	return derived.toString('hex');
}

/** Constant-time comparison that doesn't leak the length of either value. */
function secretsMatch(a: string, b: string): boolean {
	return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}

export async function hashPassword(password: string): Promise<{ passwordHash: string; passwordSalt: string }> {
	const passwordSalt = randomBytes(16).toString('hex');
	const passwordHash = await derive(password, passwordSalt);
	return { passwordHash, passwordSalt };
}

/** Verifies an email+password pair, returning the matching user or null. */
export async function verifyUserCredentials(email: string, password: string) {
	const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
	if (!user?.passwordHash || !user.passwordSalt) return null;

	const candidate = await derive(password, user.passwordSalt);
	if (!secretsMatch(candidate, user.passwordHash)) return null;

	return user;
}

export class EmailAlreadyRegisteredError extends Error {
	constructor() {
		super('Ya existe una cuenta con ese email');
	}
}

/** Creates a new account, optionally already linked to a coach (via invite). */
export async function registerUser(params: { email: string; password: string; name?: string; role: Role; coachId?: string }) {
	const email = params.email.trim().toLowerCase();
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) throw new EmailAlreadyRegisteredError();

	const { passwordHash, passwordSalt } = await hashPassword(params.password);
	return prisma.user.create({
		data: {
			email,
			name: params.name,
			role: params.role,
			passwordHash,
			passwordSalt,
			coachId: params.coachId
		}
	});
}
