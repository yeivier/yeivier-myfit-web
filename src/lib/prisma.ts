import { PrismaClient } from '@prisma/client';

// Netlify DB provisions Postgres automatically and exposes its connection
// string via @netlify/database. Fall back to it when DATABASE_URL isn't set
// directly (e.g. local dev without a .env, or the Netlify build/runtime env).
if (!process.env.DATABASE_URL) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { getConnectionString } = require('@netlify/database');
		process.env.DATABASE_URL = getConnectionString();
	} catch {
		// @netlify/database not available or no Netlify DB provisioned; leave unset.
	}
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
