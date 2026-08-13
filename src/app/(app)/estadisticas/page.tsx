import Link from 'next/link';
import { LineChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/app/empty-state';
import { PageHeader } from '@/components/app/page-header';
import { findMesocycleById, loadMesocycles } from '@/lib/server/mesocycles';
import { arraySum } from '@/lib/utils';
import { formatDate, formatNumber } from '@/lib/utils/format';
import { muscleGroupLabels } from '@/lib/utils/labels';
import {
	generatePerformanceChangesPerMuscleGroup,
	generatePerformanceChangesPerSplitDay,
	getSetsPerformedPerMuscleGroup
} from '@/lib/utils/mesocycleUtils';
import { getWorkoutVolume } from '@/lib/utils/workoutUtils';
import type { MuscleGroup } from '@prisma/client';

export const metadata = { title: 'Estadísticas — MyFit' };

function muscleGroupText(muscleGroup: string) {
	return muscleGroupLabels[muscleGroup as MuscleGroup] ?? muscleGroup;
}

function ChangeBar({ label, value }: { label: string; value: number }) {
	const magnitude = Math.min(100, Math.abs(value) * 4);
	const isPositive = value >= 0;

	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center justify-between gap-3 text-sm">
				<span className="truncate">{label}</span>
				<span className={isPositive ? 'font-medium text-primary' : 'font-medium text-destructive'}>
					{isPositive ? '+' : ''}
					{formatNumber(value)}%
				</span>
			</div>
			<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
				<div
					className={isPositive ? 'h-full rounded-full bg-primary' : 'h-full rounded-full bg-destructive'}
					style={{ width: `${Math.max(4, magnitude)}%` }}
				/>
			</div>
		</div>
	);
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ mesociclo?: string }> }) {
	const { mesociclo } = await searchParams;
	const mesocycles = await loadMesocycles({});

	if (mesocycles.length === 0) {
		return (
			<div className="flex flex-col gap-6">
				<PageHeader title="Estadísticas" description="Progresión de volumen y series por grupo muscular" />
				<EmptyState
					Icon={LineChart}
					title="Todavía no hay datos para analizar"
					description="Las estadísticas se calculan a partir de los entrenamientos registrados dentro de un mesociclo."
				>
					<Button asChild>
						<Link href="/mesociclos/nuevo">Crear un mesociclo</Link>
					</Button>
				</EmptyState>
			</div>
		);
	}

	const selectedId = mesociclo && mesocycles.some((m) => m.id === mesociclo) ? mesociclo : mesocycles[0].id;
	const mesocycle = await findMesocycleById(selectedId);

	const workoutsOfMesocycle = (mesocycle?.workoutsOfMesocycle ?? []).filter((wm) => wm.workoutStatus === null);
	const totalVolume = arraySum(workoutsOfMesocycle.map((wm) => getWorkoutVolume(wm.workout)));
	const totalSets = arraySum(
		workoutsOfMesocycle.flatMap((wm) => wm.workout.workoutExercises.map((exercise) => exercise.sets.length))
	);
	const performancePerMuscleGroup = generatePerformanceChangesPerMuscleGroup(workoutsOfMesocycle);
	const performancePerSplitDay = mesocycle ? generatePerformanceChangesPerSplitDay(mesocycle) : [];
	const setsPerMuscleGroup = getSetsPerformedPerMuscleGroup(workoutsOfMesocycle);
	const maxSets = Math.max(1, ...setsPerMuscleGroup.map((group) => group.totalSets));

	return (
		<div className="flex flex-col gap-6">
			<PageHeader title="Estadísticas" description="Progresión de volumen y series por grupo muscular" />

			<div className="flex flex-wrap gap-2">
				{mesocycles.map((option) => (
					<Button
						key={option.id}
						asChild
						size="sm"
						variant={option.id === selectedId ? 'default' : 'outline'}
					>
						<Link href={`/estadisticas?mesociclo=${option.id}`}>{option.name}</Link>
					</Button>
				))}
			</div>

			<Card className="flex flex-col gap-3 p-5">
				<div className="flex flex-wrap items-center gap-1.5">
					<Badge variant="secondary">{mesocycle?.name}</Badge>
					{mesocycle?.startDate && (
						<span className="text-xs text-muted-foreground">Desde el {formatDate(mesocycle.startDate)}</span>
					)}
				</div>
				<div className="grid grid-cols-3 gap-4">
					<div className="flex flex-col">
						<span className="text-xs text-muted-foreground">Entrenamientos</span>
						<span className="text-lg font-semibold">{workoutsOfMesocycle.length}</span>
					</div>
					<div className="flex flex-col">
						<span className="text-xs text-muted-foreground">Series</span>
						<span className="text-lg font-semibold">{totalSets}</span>
					</div>
					<div className="flex flex-col">
						<span className="text-xs text-muted-foreground">Volumen</span>
						<span className="text-lg font-semibold">{formatNumber(totalVolume, 0)} kg</span>
					</div>
				</div>
			</Card>

			{workoutsOfMesocycle.length === 0 ? (
				<EmptyState
					Icon={LineChart}
					title="Este mesociclo todavía no tiene entrenamientos"
					description="Registrá al menos dos sesiones para ver la progresión por grupo muscular."
				>
					<Button asChild>
						<Link href="/entrenamientos/nuevo">Entrenar ahora</Link>
					</Button>
				</EmptyState>
			) : (
				<>
					<div className="flex flex-col gap-2">
						<h2 className="text-sm font-semibold text-muted-foreground">Series por grupo muscular</h2>
						<Card className="flex flex-col gap-3 p-5">
							{setsPerMuscleGroup.toReversed().map((group) => (
								<div key={group.muscleGroup} className="flex flex-col gap-1">
									<div className="flex items-center justify-between gap-3 text-sm">
										<span className="truncate">{muscleGroupText(group.muscleGroup)}</span>
										<span className="font-medium">{group.totalSets}</span>
									</div>
									<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
										<div
											className="h-full rounded-full bg-primary"
											style={{ width: `${(group.totalSets / maxSets) * 100}%` }}
										/>
									</div>
								</div>
							))}
						</Card>
					</div>

					{performancePerMuscleGroup.length > 0 && (
						<div className="flex flex-col gap-2">
							<h2 className="text-sm font-semibold text-muted-foreground">Cambio de rendimiento por grupo muscular</h2>
							<Card className="flex flex-col gap-3 p-5">
								{performancePerMuscleGroup.toReversed().map((group) => (
									<ChangeBar
										key={group.muscleGroup}
										label={muscleGroupText(group.muscleGroup)}
										value={group.averagePercentageChange}
									/>
								))}
							</Card>
						</div>
					)}

					{performancePerSplitDay.length > 0 && (
						<div className="flex flex-col gap-2">
							<h2 className="text-sm font-semibold text-muted-foreground">Cambio de rendimiento por día</h2>
							<Card className="flex flex-col gap-3 p-5">
								{performancePerSplitDay.toReversed().map((day) => (
									<ChangeBar key={day.splitDayName} label={day.splitDayName} value={day.averagePercentageChange} />
								))}
							</Card>
						</div>
					)}
				</>
			)}
		</div>
	);
}
