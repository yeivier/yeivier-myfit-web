'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Moon, CheckCircle2, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getTodaysWorkoutData, getWorkoutExercisesWithPreviousData, createWorkout } from '@/lib/server/workouts';
import type { CreateWorkoutInput } from '@/lib/server/workouts';
import type { WorkoutExerciseInProgress } from '@/lib/utils/workoutUtils';
import { muscleGroupLabels } from '@/lib/constants/labels';

type Stage = 'loading' | 'no-mesocycle' | 'rest-day' | 'bodyweight' | 'training' | 'done';

export function TrainToday() {
	const router = useRouter();
	const [stage, setStage] = useState<Stage>('loading');
	const [todaysData, setTodaysData] = useState<Awaited<ReturnType<typeof getTodaysWorkoutData>> | null>(null);
	const [bodyweight, setBodyweight] = useState('');
	const [exercises, setExercises] = useState<WorkoutExerciseInProgress[]>([]);
	const [note, setNote] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		getTodaysWorkoutData().then((data) => {
			setTodaysData(data);
			setBodyweight(data.userBodyweight ? String(data.userBodyweight) : '');
			if (!data.workoutOfMesocycle) setStage('no-mesocycle');
			else if (data.workoutOfMesocycle.workoutStatus === 'RestDay') setStage('rest-day');
			else setStage('bodyweight');
		});
	}, []);

	function startTraining() {
		const bw = Number(bodyweight);
		if (!bw || !todaysData?.workoutOfMesocycle) return setError('Ingresá tu peso corporal');
		setError(null);
		startTransition(async () => {
			const { todaysWorkoutExercises } = await getWorkoutExercisesWithPreviousData({
				userBodyweight: bw,
				splitDayIndex: todaysData.workoutOfMesocycle!.splitDayIndex
			});
			setExercises(todaysWorkoutExercises);
			setStage('training');
		});
	}

	function updateSet(exIdx: number, setIdx: number, patch: Partial<WorkoutExerciseInProgress['sets'][number]>) {
		setExercises((prev) =>
			prev.map((ex, i) =>
				i === exIdx ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) } : ex
			)
		);
	}

	function logRestDay() {
		if (!todaysData?.workoutOfMesocycle) return;
		startTransition(async () => {
			const input: CreateWorkoutInput = {
				workoutData: {
					userBodyweight: Number(bodyweight) || 0,
					workoutOfMesocycle: {
						mesocycle: { id: todaysData.workoutOfMesocycle!.mesocycle.id },
						splitDayIndex: todaysData.workoutOfMesocycle!.splitDayIndex,
						workoutStatus: 'RestDay'
					}
				},
				workoutExercises: [],
				workoutExercisesSets: [],
				workoutExercisesMiniSets: []
			};
			await createWorkout(input);
			setStage('done');
			router.refresh();
		});
	}

	function finishWorkout() {
		if (!todaysData?.workoutOfMesocycle) return;
		const bw = Number(bodyweight) || 0;

		const workoutExercises: CreateWorkoutInput['workoutExercises'] = exercises.map((ex, exerciseIndex) => {
			const { sets, ...rest } = ex;
			void sets;
			return { ...rest, exerciseIndex };
		});
		const workoutExercisesSets: CreateWorkoutInput['workoutExercisesSets'] = exercises.map((ex) =>
			ex.sets.map((set, setIndex) => ({
				setIndex,
				reps: set.reps ?? 0,
				load: set.load ?? 0,
				RIR: set.RIR ?? 0,
				skipped: set.skipped
			}))
		);
		const workoutExercisesMiniSets: CreateWorkoutInput['workoutExercisesMiniSets'] = exercises.map((ex) =>
			ex.sets.map(() => [])
		);

		startTransition(async () => {
			const input: CreateWorkoutInput = {
				workoutData: {
					userBodyweight: bw,
					note: note || undefined,
					workoutOfMesocycle: {
						mesocycle: { id: todaysData.workoutOfMesocycle!.mesocycle.id },
						splitDayIndex: todaysData.workoutOfMesocycle!.splitDayIndex,
						workoutStatus: null
					}
				},
				workoutExercises,
				workoutExercisesSets,
				workoutExercisesMiniSets
			};
			try {
				await createWorkout(input);
				setStage('done');
				router.refresh();
			} catch {
				setError('No se pudo guardar el entrenamiento, probá de nuevo');
			}
		});
	}

	if (stage === 'loading') return <p className="text-muted-foreground text-sm">Cargando...</p>;

	if (stage === 'no-mesocycle') {
		return (
			<Card>
				<CardHeader className="items-center py-10 text-center">
					<CardTitle>No tenés un mesociclo activo</CardTitle>
					<CardDescription>Iniciá uno para empezar a registrar entrenamientos.</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center">
					<Button asChild>
						<Link href="/mesociclos">Ir a Mesociclos</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (stage === 'rest-day') {
		return (
			<Card>
				<CardHeader className="items-center py-10 text-center">
					<Moon className="text-muted-foreground mb-2 size-8" />
					<CardTitle>Hoy es día de descanso</CardTitle>
					<CardDescription>{todaysData?.workoutOfMesocycle?.splitDayName}</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center">
					<Button onClick={logRestDay} disabled={isPending} className="gap-2">
						<CheckCircle2 className="size-4" />
						{isPending ? 'Guardando...' : 'Marcar como completado'}
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (stage === 'done') {
		return (
			<Card>
				<CardHeader className="items-center py-10 text-center">
					<CheckCircle2 className="text-primary mb-2 size-8" />
					<CardTitle>¡Entrenamiento guardado!</CardTitle>
				</CardHeader>
			</Card>
		);
	}

	if (stage === 'bodyweight') {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{todaysData?.workoutOfMesocycle?.splitDayName}</CardTitle>
					<CardDescription>Ciclo {todaysData?.workoutOfMesocycle?.cycleNumber}</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label htmlFor="bodyweight">Peso corporal (kg)</Label>
						<Input
							id="bodyweight"
							type="number"
							step="0.1"
							value={bodyweight}
							onChange={(e) => setBodyweight(e.target.value)}
						/>
					</div>
					{error && <p className="text-destructive text-sm">{error}</p>}
					<Button onClick={startTraining} disabled={isPending} size="lg">
						{isPending ? 'Cargando...' : 'Empezar entrenamiento'}
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-xl font-bold">{todaysData?.workoutOfMesocycle?.splitDayName}</h1>
			{exercises.map((ex, exIdx) => (
				<Card key={exIdx}>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{ex.name}</CardTitle>
						<CardDescription>
							{muscleGroupLabels[ex.targetMuscleGroup]} · {ex.repRangeStart}-{ex.repRangeEnd} reps
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						<div className="text-muted-foreground grid grid-cols-[2rem_1fr_1fr_1fr_auto] gap-2 text-xs font-medium">
							<span>#</span>
							<span>Reps</span>
							<span>Peso</span>
							<span>RIR</span>
							<span></span>
						</div>
						{ex.sets.map((set, setIdx) => (
							<div key={setIdx} className="grid grid-cols-[2rem_1fr_1fr_1fr_auto] items-center gap-2">
								<span className="text-muted-foreground text-sm">{setIdx + 1}</span>
								<Input
									type="number"
									className="h-9"
									value={set.reps ?? ''}
									disabled={set.skipped}
									onChange={(e) => updateSet(exIdx, setIdx, { reps: Number(e.target.value) })}
								/>
								<Input
									type="number"
									step="0.5"
									className="h-9"
									value={set.load ?? ''}
									disabled={set.skipped}
									onChange={(e) => updateSet(exIdx, setIdx, { load: Number(e.target.value) })}
								/>
								<Input
									type="number"
									className="h-9"
									value={set.RIR ?? ''}
									disabled={set.skipped}
									onChange={(e) => updateSet(exIdx, setIdx, { RIR: Number(e.target.value) })}
								/>
								<button
									type="button"
									onClick={() => updateSet(exIdx, setIdx, { skipped: !set.skipped })}
									className={`rounded-full p-2 ${set.skipped ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground hover:bg-accent'}`}
									title="Omitir serie"
								>
									<SkipForward className="size-4" />
								</button>
							</div>
						))}
					</CardContent>
				</Card>
			))}

			<div className="flex flex-col gap-2">
				<Label htmlFor="note">Nota (opcional)</Label>
				<textarea
					id="note"
					value={note}
					onChange={(e) => setNote(e.target.value)}
					className="border-input min-h-20 rounded-lg border bg-transparent p-3 text-sm shadow-sm outline-none"
				/>
			</div>

			{error && <p className="text-destructive text-sm">{error}</p>}

			<Button onClick={finishWorkout} disabled={isPending} size="lg" className="gap-2">
				<CheckCircle2 className="size-4" />
				{isPending ? 'Guardando...' : 'Terminar entrenamiento'}
			</Button>
		</div>
	);
}
