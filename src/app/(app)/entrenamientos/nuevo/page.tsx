import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/app/page-header';
import { WorkoutLogger, type LoggerWorkoutOfMesocycle } from '@/components/workouts/workout-logger';
import { getSkippedWorkoutData, getSkippedWorkoutsOfCurrentCycle, getTodaysWorkoutData } from '@/lib/server/workouts';
import { getRIRForWeek } from '@/lib/utils/workoutUtils';

export const metadata = { title: 'Nuevo entrenamiento — MyFit' };

export default async function NewWorkoutPage({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
	const { dia } = await searchParams;
	const skippedDayIndex = dia !== undefined && Number.isInteger(Number(dia)) ? Number(dia) : null;

	/** Un índice de día inválido en la URL vuelve al entrenamiento de hoy. */
	async function loadWorkoutData() {
		if (skippedDayIndex === null) return getTodaysWorkoutData();
		try {
			return await getSkippedWorkoutData(skippedDayIndex);
		} catch {
			return getTodaysWorkoutData();
		}
	}

	const [todaysWorkoutData, skippedWorkouts] = await Promise.all([
		loadWorkoutData(),
		getSkippedWorkoutsOfCurrentCycle()
	]);

	const wm = todaysWorkoutData.workoutOfMesocycle;
	let workoutOfMesocycle: LoggerWorkoutOfMesocycle | null = null;

	if (wm) {
		let RIR: number | null = null;
		try {
			RIR = getRIRForWeek(wm.mesocycle.RIRProgression, wm.cycleNumber);
		} catch {
			RIR = null;
		}

		workoutOfMesocycle = {
			mesocycleId: wm.mesocycle.id,
			mesocycleName: wm.mesocycle.name,
			splitDayName: wm.splitDayName,
			splitDayIndex: wm.splitDayIndex,
			isRestDay: wm.workoutStatus === 'RestDay',
			cycleNumber: wm.cycleNumber,
			RIR
		};
	}

	const pendingSkipped = skippedDayIndex === null ? skippedWorkouts : [];

	return (
		<div className="flex flex-col gap-6">
			<Button asChild variant="ghost" size="sm" className="w-fit gap-1.5">
				<Link href="/entrenamientos">
					<ArrowLeft className="size-3.5" />
					Entrenamientos
				</Link>
			</Button>

			<PageHeader
				title="Nuevo entrenamiento"
				description={
					workoutOfMesocycle
						? `${workoutOfMesocycle.mesocycleName} · ${workoutOfMesocycle.splitDayName}`
						: 'Entrenamiento libre, sin mesociclo activo'
				}
			/>

			{pendingSkipped.length > 0 && (
				<Card className="flex flex-col gap-2 p-5">
					<p className="text-sm font-medium">Entrenamientos salteados de este ciclo</p>
					<div className="flex flex-wrap gap-2">
						{pendingSkipped.map((workout) => (
							<Button key={workout.splitDayIndex} asChild variant="outline" size="sm">
								<Link href={`/entrenamientos/nuevo?dia=${workout.splitDayIndex}`}>{workout.splitDayName}</Link>
							</Button>
						))}
					</div>
					<p className="text-xs text-muted-foreground">
						Podés recuperarlos antes de terminar el ciclo; reemplazan al registro salteado.
					</p>
				</Card>
			)}

			<WorkoutLogger
				initialBodyweight={todaysWorkoutData.userBodyweight}
				workoutOfMesocycle={workoutOfMesocycle}
			/>
		</div>
	);
}
