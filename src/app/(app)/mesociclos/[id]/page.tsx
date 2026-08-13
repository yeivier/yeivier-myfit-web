import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Dumbbell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/app/page-header';
import { ConfirmDeleteButton } from '@/components/app/confirm-delete-button';
import { MesocycleStageButton } from '@/components/mesocycles/mesocycle-stage-button';
import { deleteMesocycleAction } from '@/lib/actions/mesocycles';
import { findMesocycleById } from '@/lib/server/mesocycles';
import { arraySum } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';
import { muscleGroupName, setTypeLabels } from '@/lib/utils/labels';

export const metadata = { title: 'Mesociclo — MyFit' };

export default async function MesocyclePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const mesocycle = await findMesocycleById(id);
	if (!mesocycle) notFound();

	const weeks = arraySum(mesocycle.RIRProgression);
	const trainingDays = mesocycle.mesocycleExerciseSplitDays.length;
	const totalWorkouts = weeks * trainingDays;
	const completedWorkouts = mesocycle.workoutsOfMesocycle.length;
	const progress = totalWorkouts > 0 ? Math.min(100, Math.round((completedWorkouts / totalWorkouts) * 100)) : 0;
	const status = mesocycle.endDate ? 'Completado' : mesocycle.startDate ? 'Activo' : 'Sin iniciar';
	const isActive = Boolean(mesocycle.startDate && !mesocycle.endDate);

	return (
		<div className="flex flex-col gap-6">
			<Button asChild variant="ghost" size="sm" className="w-fit gap-1.5">
				<Link href="/mesociclos">
					<ArrowLeft className="size-3.5" />
					Mesociclos
				</Link>
			</Button>

			<PageHeader
				title={mesocycle.name}
				description={mesocycle.exerciseSplit ? `Basado en el split "${mesocycle.exerciseSplit.name}"` : undefined}
			>
				<MesocycleStageButton
					id={mesocycle.id}
					startDate={mesocycle.startDate ? mesocycle.startDate.toISOString() : null}
					endDate={mesocycle.endDate ? mesocycle.endDate.toISOString() : null}
					size="default"
				/>
				<ConfirmDeleteButton
					title={`¿Eliminar "${mesocycle.name}"?`}
					description="Se eliminan también los entrenamientos registrados dentro de este mesociclo."
					action={deleteMesocycleAction.bind(null, mesocycle.id)}
					redirectTo="/mesociclos"
				/>
			</PageHeader>

			<Card className="flex flex-col gap-3 p-5">
				<div className="flex flex-wrap items-center gap-1.5">
					<Badge variant={isActive ? 'default' : 'secondary'}>{status}</Badge>
					<Badge variant="outline">
						{weeks} {weeks === 1 ? 'semana' : 'semanas'}
					</Badge>
					<Badge variant="outline">Sobrecarga {mesocycle.startOverloadPercentage}%</Badge>
					{mesocycle.startDate && (
						<span className="text-xs text-muted-foreground">Iniciado el {formatDate(mesocycle.startDate)}</span>
					)}
					{mesocycle.endDate && (
						<span className="text-xs text-muted-foreground">Finalizado el {formatDate(mesocycle.endDate)}</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Progreso</span>
						<span className="font-medium">
							{completedWorkouts} de {totalWorkouts} entrenamientos
						</span>
					</div>
					<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
						<div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
					</div>
				</div>

				{isActive && (
					<Button asChild className="mt-1 w-full gap-1.5 sm:w-fit">
						<Link href="/entrenamientos/nuevo">
							<Dumbbell className="size-4" />
							Entrenar ahora
						</Link>
					</Button>
				)}
			</Card>

			<div className="flex flex-col gap-2">
				<h2 className="text-sm font-semibold text-muted-foreground">Días y ejercicios</h2>
				{mesocycle.mesocycleExerciseSplitDays.map((day) => (
					<Card key={day.id} className="flex flex-col gap-3 p-5">
						<div className="flex items-center justify-between gap-2">
							<p className="font-semibold">{day.name}</p>
							{day.isRestDay && <Badge variant="secondary">Descanso</Badge>}
						</div>
						{!day.isRestDay && (
							<div className="flex flex-col gap-2">
								{day.mesocycleSplitDayExercises.map((exercise) => (
									<div key={exercise.id} className="flex items-center justify-between gap-3 border-t pt-2 first:border-0 first:pt-0">
										<div className="flex min-w-0 flex-col">
											<span className="truncate text-sm font-medium">{exercise.name}</span>
											<span className="text-xs text-muted-foreground">
												{muscleGroupName(exercise.targetMuscleGroup, exercise.customMuscleGroup)} ·{' '}
												{setTypeLabels[exercise.setType]}
											</span>
										</div>
										<span className="shrink-0 text-sm text-muted-foreground">
											{exercise.sets} × {exercise.repRangeStart}-{exercise.repRangeEnd}
										</span>
									</div>
								))}
							</div>
						)}
					</Card>
				))}
			</div>

			{mesocycle.mesocycleCyclicSetChanges.length > 0 && (
				<div className="flex flex-col gap-2">
					<h2 className="text-sm font-semibold text-muted-foreground">Progresión de series</h2>
					<Card className="flex flex-col divide-y p-1">
						{mesocycle.mesocycleCyclicSetChanges.map((change) => (
							<div key={change.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
								<span>{muscleGroupName(change.muscleGroup, change.customMuscleGroup)}</span>
								<span className="text-muted-foreground">
									+{change.setIncreaseAmount} series · máx. {change.maxVolume}
								</span>
							</div>
						))}
					</Card>
				</div>
			)}
		</div>
	);
}
