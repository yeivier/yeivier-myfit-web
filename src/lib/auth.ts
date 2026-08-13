import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [Google, GitHub],
	trustHost: true,
	callbacks: {
		session({ session, user }) {
			session.user.id = user.id;
			return session;
		}
	},
	pages: {
		signIn: '/'
	}
});
