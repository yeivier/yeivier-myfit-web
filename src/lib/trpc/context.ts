import { error, type RequestEvent } from '@sveltejs/kit';

export async function createContext(event: RequestEvent) {
	const session = await event.locals.auth();
	if (!session?.user?.id) error(401, 'No has iniciado sesión');
	return { event, userId: session.user.id };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
