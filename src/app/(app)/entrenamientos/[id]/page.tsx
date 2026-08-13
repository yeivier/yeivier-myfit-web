import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDeleteButton } from '@/components/app/confirm-delete-button';
import { PageHeader } from '@/components/app/page-header';
import { deleteWorkoutAction } from '@/lib/actions/workouts';
import { findWorkoutById } from '@/lib/server/workouts';
import { formatDateTime, formatDuration, formatNumber } from '@/lib/utils/format';
import { muscleGroupName, setTypeLabels } from '@/lib/utils/labels';
import { getWorkoutVolume } from '@/lib/utils/workoutUtils';

export const metadata = { title: 'Entrenamiento — MyFit' };

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const workout = await findWorkoutById(id);
	if (!workout) notFound();

	const wm = workout.workoutOfMesocycle;
	const status = wm?.workoutStatus;
	const title = wm
		? (wm.mesocycle.mesocycleExerciseSplitDays[wm.splitDayIndex]?.name ?? 'Entrenamiento')
		: 'Entrenamiento libre';
	const volume = status === null || status === undefined ? getWorkoutVolume(workout) : 0;
	const totalSets = workout.workoutExercises.reduce((total, exercise) => total + exercise.sets.length, 0);

	return (
		<div className="flex flex-col gap-6">
			<Button asChild variant="ghost" size="sm" className="w-fit gap-1.5">
				<Link href="/entrenamientos">
					<ArrowLeft className="size-3.5" />
					Entrenamientos
				</Link>
			</Button>

			<PageHeader title={title} description={formatDateTime(workout.startedAt)}>
				<ConfirmDeleteButton
					title="¿Eliminar este entrenamiento?"
					description="Se borran las series registradas. Del mesociclo activo solo se puede eliminar el último entrenamiento."
					action={deleteWorkoutAction.bind(null, workout.id)}
					redirectTo="/entrenamientos"
				/>
			</PageHeader>

			<Card className="flex flex-col gap-3 p-5">
				<div className="flex flex-wrap items-center gap-1.5">
					{status === 'RestDay' && <Badge variant="secondary">Día de descanso</Badge>}
					{status === 'Skipped' && <Badge variant="outline">Salteado</Badge>}
					{wm && <Badge variant="outline">{wm.mesocycle.name}</Badge>}
				</div>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div className="flex flex-col">
						<span className="text-xs text-muted-foreground">Duración</span>
						<span className="font-medium">{formatDuration(workout.startedAt, workout.endedAt)}</span>
					</div>
					<div className="flex flex-col">
						<span className="text-xs text-muted-foreground">Peso corporal</span>
						<span className="font-medium">{formatNumber(workout.userBodyweight)} kg</span>
					</div>
					<div className="flex flex-col">
						<span className="text-xs text-muted-foreground">Series</span>
						<span className="font-medium">{totalSets}</span>
					</div>
					<div className="flex flex-col">
						<span className="text-xs text-muted-foreground">Volumen</span>
						<span className="font-medium">{formatNumber(volume, 0)} kg</span>
					</div>
				</div>
				{workout.note && <p className="border-t pt-3 text-sm text-muted-foreground italic">{workout.note}</p>}
			</Card>

			{workout.workoutExercises.map((exercise) => (
				<Card key={exercise.id} className="flex flex-col gap-3 p-5">
					<div className="flex flex-col">
						<p className="font-semibold">{exercise.name}</p>
						<p className="text-xs text-muted-foreground">
							{muscleGroupName(exercise.targetMuscleGroup, exercise.customMuscleGroup)} ·{' '}
							{setTypeLabels[exercise.setType]}
						</p>
					</div>

					<div className="flex flex-col gap-1.5">
						{exercise.sets.map((set, setIndex) => (
							<div key={set.id} className="flex flex-col gap-1 border-t pt-1.5 first:border-0 first:pt-0">
								<div className="flex items-center justify-between gap-3 text-sm">
									<span className="text-muted-foreground">Serie {setIndex + 1}</span>
									{set.skipped ? (
										<span className="text-muted-foreground">Salteada</span>
									) : (
										<span className="font-medium">
											{set.reps} × {formatNumber(set.load)} kg · {set.RIR} RIR
										</span>
									)}
								</div>
								{set.miniSets.map((miniSet, miniSetIndex) => (
									<div key={miniSet.id} className="flex items-center justify-between gap-3 pl-4 text-xs text-muted-foreground">
										<span>Mini {miniSetIndex + 1}</span>
										<span>
											{miniSet.reps} × {formatNumber(miniSet.load)} kg · {miniSet.RIR} RIR
										</span>
									</div>
								))}
							</div>
						))}
					</div>

					{exercise.note && <p className="text-xs text-muted-foreground italic">{exercise.note}</p>}
				</Card>
			))}
		</div>
	);
}
