import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			role: 'COACH' | 'ATHLETE';
		} & DefaultSession['user'];
	}

	interface User extends DefaultUser {
		role?: 'COACH' | 'ATHLETE';
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id?: string;
		role?: 'COACH' | 'ATHLETE';
	}
}
