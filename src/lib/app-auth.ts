import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { prisma } from '@/lib/prisma';

const scryptAsync = promisify(scrypt);

/** The app is single-tenant, so `AppAuth` always holds exactly one row. */
const ROW_ID = 'default';

/** Minimum length accepted when the password is chosen for the first time. */
export const MIN_PASSWORD_LENGTH = 6;

type AppAuthRow = {
	sessionSecret: string;
	passwordHash: string | null;
	passwordSalt: string | null;
};

/**
 * Reads the config row, creating it with a freshly generated JWT signing
 * secret the first time the app runs. Two cold starts can race on the insert;
 * the loser re-reads the winning row so both end up with the same secret.
 */
async function readOrCreateRow(): Promise<AppAuthRow> {
	const existing = await prisma.appAuth.findUnique({ where: { id: ROW_ID } });
	if (existing) return existing;

	try {
		return await prisma.appAuth.create({
			data: { id: ROW_ID, sessionSecret: randomBytes(32).toString('hex') }
		});
	} catch {
		const winner = await prisma.appAuth.findUnique({ where: { id: ROW_ID } });
		if (!winner) throw new Error('No se pudo inicializar la configuración de autenticación');
		return winner;
	}
}

let cachedSecret: Promise<string> | undefined;

/**
 * Secret used to sign session JWTs. `AUTH_SECRET` wins when it is set, but the
 * database-backed value means a missing environment variable no longer takes
 * the whole app down with a "server configuration" error.
 */
export function getSessionSecret(): Promise<string> {
	const fromEnv = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
	if (fromEnv) return Promise.resolve(fromEnv);

	cachedSecret ??= readOrCreateRow()
		.then((row) => row.sessionSecret)
		.catch((error) => {
			// Never cache a transient database failure: retry on the next request.
			cachedSecret = undefined;
			throw error;
		});

	return cachedSecret;
}

async function derive(password: string, salt: string): Promise<string> {
	const derived = (await scryptAsync(password.normalize('NFKC'), salt, 64)) as Buffer;
	return derived.toString('hex');
}

/** Constant-time comparison that doesn't leak the length of either value. */
function secretsMatch(a: string, b: string): boolean {
	return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}

/** Whether a password already exists, i.e. the app is past its initial setup. */
export async function isPasswordConfigured(): Promise<boolean> {
	if (process.env.APP_PASSWORD) return true;

	try {
		const row = await readOrCreateRow();
		return row.passwordHash !== null && row.passwordSalt !== null;
	} catch {
		// Don't offer the first-run experience if we can't confirm it applies.
		return true;
	}
}

/**
 * Checks the submitted password. On a fresh install — no `APP_PASSWORD` env var
 * and nothing stored yet — the first password submitted becomes the app
 * password, so the site can be claimed without any dashboard access.
 */
export async function verifyOrClaimPassword(password: string): Promise<boolean> {
	const fromEnv = process.env.APP_PASSWORD;
	if (fromEnv) return secretsMatch(password, fromEnv);

	const row = await readOrCreateRow();
	if (row.passwordHash && row.passwordSalt) {
		return secretsMatch(await derive(password, row.passwordSalt), row.passwordHash);
	}

	if (password.length < MIN_PASSWORD_LENGTH) return false;

	const passwordSalt = randomBytes(16).toString('hex');
	const passwordHash = await derive(password, passwordSalt);
	const { count } = await prisma.appAuth.updateMany({
		where: { id: ROW_ID, passwordHash: null },
		data: { passwordHash, passwordSalt }
	});

	// A concurrent request may have claimed the app first, in which case this
	// password has to match theirs. The row is now set, so this can't recurse.
	return count > 0 ? true : verifyOrClaimPassword(password);
}
