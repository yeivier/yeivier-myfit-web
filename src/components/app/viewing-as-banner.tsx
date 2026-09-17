import { Eye } from 'lucide-react';
import { getViewingAthlete, stopViewingAthlete } from '@/lib/coach';

export async function ViewingAsBanner() {
	const athlete = await getViewingAthlete();
	if (!athlete) return null;

	return (
		<form
			action={async () => {
				'use server';
				await stopViewingAthlete();
			}}
			className="bg-primary text-primary-foreground flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
		>
			<Eye className="size-4" />
			Viendo como {athlete.name ?? 'alumno'}
			<button type="submit" className="ml-2 underline underline-offset-2">
				Salir
			</button>
		</form>
	);
}
