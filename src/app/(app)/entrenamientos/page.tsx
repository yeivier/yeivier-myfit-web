import Link from 'next/link';
import { Dumbbell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/app/empty-state';
import { PageHeader } from '@/components/app/page-header';
import { WorkoutList } from '@/components/workouts/workout-list';
import { loadWorkouts } from '@/lib/server/workouts';

export const metadata = { title: 'Entrenamientos — MyFit' };

export default async function WorkoutsPage() {
	const workouts = await loadWorkouts({});

	return (
		<div className="flex flex-col gap-6">
			<PageHeader title="Entrenamientos" description="Historial de sesiones registradas">
				<Button asChild className="gap-1.5">
					<Link href="/entrenamientos/nuevo">
						<Plus className="size-4" />
						Entrenar
					</Link>
				</Button>
			</PageHeader>

			{workouts.length === 0 ? (
				<EmptyState
					Icon={Dumbbell}
					title="Todavía no registraste entrenamientos"
					description="Podés entrenar con un mesociclo activo para tener progresión automática, o registrar una sesión libre."
				>
					<Button asChild className="gap-1.5">
						<Link href="/entrenamientos/nuevo">
							<Plus className="size-4" />
							Registrar entrenamiento
						</Link>
					</Button>
				</EmptyState>
			) : (
				<WorkoutList initialWorkouts={workouts} />
			)}
		</div>
	);
}
