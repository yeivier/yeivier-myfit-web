import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';

/** Site-wide config is single-tenant, so `AppAuth` always holds exactly one row. */
const ROW_ID = 'default';

/**
 * Reads the config row, creating it with a freshly generated JWT signing
 * secret the first time the app runs. Two cold starts can race on the insert;
 * the loser re-reads the winning row so both end up with the same secret.
 */
async function readOrCreateRow(): Promise<{ sessionSecret: string }> {
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
