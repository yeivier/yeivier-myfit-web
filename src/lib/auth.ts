import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getSessionSecret } from '@/lib/app-auth';
import { verifyUserCredentials } from '@/lib/user-auth';
import { prisma } from '@/lib/prisma';

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
			name: 'Credenciales',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Contraseña', type: 'password' }
			},
			async authorize(credentials) {
				const email = credentials?.email;
				const password = credentials?.password;
				if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) return null;

				const user = await verifyUserCredentials(email, password);
				if (!user) return null;

				return { id: user.id, email: user.email, name: user.name, role: user.role };
			}
		})
	],
	trustHost: true,
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = user.role;
			}
			return token;
		},
		session({ session, token }) {
			if (token?.id) session.user.id = token.id as string;
			if (token?.role) session.user.role = token.role as 'COACH' | 'ATHLETE';
			return session;
		}
	},
	pages: {
		signIn: '/'
	}
}));
