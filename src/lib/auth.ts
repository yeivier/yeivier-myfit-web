import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getSessionSecret, verifyOrClaimPassword } from '@/lib/app-auth';
import { prisma } from '@/lib/prisma';

// Single-user app gated by a shared password instead of OAuth. The account is
// keyed to a fixed owner email so existing data (mesocycles, workouts, etc.)
// always resolves to the same user.
const OWNER_EMAIL = 'javiercorralv@gmail.com';

export const { handlers, auth, signIn, signOut } = NextAuth(async () => ({
	adapter: PrismaAdapter(prisma),
	// Credentials-based sign in requires JWT sessions (no adapter-backed
	// database session for this provider type).
	session: { strategy: 'jwt' },
	// Resolved lazily so the secret can come from the database when no
	// AUTH_SECRET environment variable is configured.
	secret: await getSessionSecret(),
	providers: [
		Credentials({
			name: 'Contraseña',
			credentials: {
				password: { label: 'Contraseña', type: 'password' }
			},
			async authorize(credentials) {
				const password = credentials?.password;
				if (typeof password !== 'string' || !password) return null;
				if (!(await verifyOrClaimPassword(password))) return null;

				const user = await prisma.user.upsert({
					where: { email: OWNER_EMAIL },
					update: {},
					create: { email: OWNER_EMAIL, name: 'Javier' }
				});

				return { id: user.id, email: user.email, name: user.name };
			}
		})
	],
	trustHost: true,
	callbacks: {
		jwt({ token, user }) {
			if (user) token.id = user.id;
			return token;
		},
		session({ session, token }) {
			if (token?.id) session.user.id = token.id as string;
			return session;
		}
	},
	pages: {
		signIn: '/'
	}
}));
