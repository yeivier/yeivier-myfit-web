'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Minus, Plus, SkipForward, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExercisePicker } from '@/components/splits/exercise-picker';
import { createWorkoutAction } from '@/lib/actions/workouts';
import { getWorkoutExercisesWithPreviousData, type CreateWorkoutInput } from '@/lib/server/workouts';
import type { SplitExerciseTemplateWithoutIdsOrIndex } from '@/lib/types/exerciseTemplates';
import { cn } from '@/lib/utils';
import { muscleGroupName, setTypeLabels } from '@/lib/utils/labels';
import type { ChangeType, MuscleGroup, SetType } from '@prisma/client';

export type LoggerWorkoutOfMesocycle = {
	mesocycleId: string;
	mesocycleName: string;
	splitDayName: string;
	splitDayIndex: number;
	isRestDay: boolean;
	cycleNumber: number;
	RIR: number | null;
};

type LoggerMiniSet = { reps: string; load: string; RIR: string };

type LoggerSet = {
	reps: string;
	load: string;
	RIR: string;
	skipped: boolean;
	miniSets: LoggerMiniSet[];
	previous: string | null;
};

type LoggerExercise = {
	name: string;
	targetMuscleGroup: MuscleGroup;
	customMuscleGroup: string | null;
	bodyweightFraction: number | null;
	setType: SetType;
	changeType: ChangeType | null;
	changeAmount: number | null;
	repRangeStart: number;
	repRangeEnd: number;
	note: string | null;
	overloadPercentage: number | null;
	lastSetToFailure: boolean | null;
	forceRIRMatching: boolean | null;
	minimumWeightChange: number | null;
	topRepRangeStart: number | null;
	topRepRangeEnd: number | null;
	sets: LoggerSet[];
};

const setTypesWithMiniSets: SetType[] = ['Drop', 'MyorepMatch', 'MyorepMatchDown'];

function emptySet(previous: string | null = null): LoggerSet {
	return { reps: '', load: '', RIR: '', skipped: false, miniSets: [], previous };
}

function numberToInput(value: number | null | undefined) {
	return value === null || value === undefined ? '' : String(value);
}

function describeSet(set: { reps: number; load: number; RIR: number }) {
	return `${set.reps} × ${set.load} kg · ${set.RIR} RIR`;
}

function exerciseFromTemplate(template: SplitExerciseTemplateWithoutIdsOrIndex): LoggerExercise {
	return {
		name: template.name,
		targetMuscleGroup: template.targetMuscleGroup,
		customMuscleGroup: template.customMuscleGroup ?? null,
		bodyweightFraction: template.bodyweightFraction ?? null,
		setType: template.setType,
		changeType: template.changeType ?? null,
		changeAmount: template.changeAmount ?? null,
		repRangeStart: template.repRangeStart,
		repRangeEnd: template.repRangeEnd,
		note: template.note ?? null,
		overloadPercentage: null,
		lastSetToFailure: null,
		forceRIRMatching: null,
		minimumWeightChange: null,
		topRepRangeStart: template.topRepRangeStart ?? null,
		topRepRangeEnd: template.topRepRangeEnd ?? null,
		sets: [emptySet(), emptySet(), emptySet()]
	};
}

/** Registro de un entrenamiento: peso corporal, ejercicios, series y minisets. */
export function WorkoutLogger({
	initialBodyweight,
	workoutOfMesocycle
}: {
	initialBodyweight: number | null;
	workoutOfMesocycle: LoggerWorkoutOfMesocycle | null;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isLoadingExercises, setIsLoadingExercises] = useState(false);
	const [started, setStarted] = useState(false);
	const [startedAt] = useState(() => new Date().toISOString());
	const [bodyweight, setBodyweight] = useState(numberToInput(initialBodyweight));
	const [note, setNote] = useState('');
	const [exercises, setExercises] = useState<LoggerExercise[]>([]);
	const [pickerOpen, setPickerOpen] = useState(false);

	const isRestDay = workoutOfMesocycle?.isRestDay ?? false;

	function updateExercise(index: number, patch: Partial<LoggerExercise>) {
		setExercises((current) => current.map((exercise, i) => (i === index ? { ...exercise, ...patch } : exercise)));
	}

	function updateSet(exerciseIndex: number, setIndex: number, patch: Partial<LoggerSet>) {
		setExercises((current) =>
			current.map((exercise, i) =>
				i === exerciseIndex
					? { ...exercise, sets: exercise.sets.map((set, j) => (j === setIndex ? { ...set, ...patch } : set)) }
					: exercise
			)
		);
	}

	function updateMiniSet(exerciseIndex: number, setIndex: number, miniSetIndex: number, patch: Partial<LoggerMiniSet>) {
		setExercises((current) =>
			current.map((exercise, i) =>
				i === exerciseIndex
					? {
							...exercise,
							sets: exercise.sets.map((set, j) =>
								j === setIndex
									? { ...set, miniSets: set.miniSets.map((miniSet, k) => (k === miniSetIndex ? { ...miniSet, ...patch } : miniSet)) }
									: set
							)
						}
					: exercise
			)
		);
	}

	function parseBodyweight() {
		const value = Number(bodyweight);
		if (!bodyweight.trim() || Number.isNaN(value) || value <= 0) return null;
		return value;
	}

	function start() {
		const userBodyweight = parseBodyweight();
		if (userBodyweight === null) {
			toast.error('Ingresá tu peso corporal para empezar');
			return;
		}

		if (!workoutOfMesocycle || isRestDay) {
			setStarted(true);
			return;
		}

		setIsLoadingExercises(true);
		startTransition(async () => {
			try {
				const data = await getWorkoutExercisesWithPreviousData({
					userBodyweight,
					splitDayIndex: workoutOfMesocycle.splitDayIndex
				});

				setExercises(
					data.todaysWorkoutExercises.map((exercise, exerciseIndex) => {
						const previousExercise = data.previousWorkoutData?.exercises[exerciseIndex];
						return {
							name: exercise.name,
							targetMuscleGroup: exercise.targetMuscleGroup,
							customMuscleGroup: exercise.customMuscleGroup ?? null,
							bodyweightFraction: exercise.bodyweightFraction ?? null,
							setType: exercise.setType,
							changeType: exercise.changeType ?? null,
							changeAmount: exercise.changeAmount ?? null,
							repRangeStart: exercise.repRangeStart,
							repRangeEnd: exercise.repRangeEnd,
							note: exercise.note ?? null,
							overloadPercentage: exercise.overloadPercentage ?? null,
							lastSetToFailure: exercise.lastSetToFailure ?? null,
							forceRIRMatching: exercise.forceRIRMatching ?? null,
							minimumWeightChange: exercise.minimumWeightChange ?? null,
							topRepRangeStart: exercise.topRepRangeStart ?? null,
							topRepRangeEnd: exercise.topRepRangeEnd ?? null,
							sets: exercise.sets.map((set, setIndex) => {
								const previousSet = previousExercise?.sets[setIndex];
								return {
									reps: numberToInput(set.reps),
									load: numberToInput(set.load),
									RIR: numberToInput(set.RIR),
									skipped: false,
									miniSets: set.miniSets.map((miniSet) => ({
										reps: numberToInput(miniSet.reps),
										load: numberToInput(miniSet.load),
										RIR: numberToInput(miniSet.RIR)
									})),
									previous: previousSet ? describeSet(previousSet) : null
								};
							})
						};
					})
				);
				setStarted(true);
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'No se pudieron cargar los ejercicios');
			} finally {
				setIsLoadingExercises(false);
			}
		});
	}

	function buildInput(workoutStatus: 'RestDay' | 'Skipped' | null): CreateWorkoutInput | null {
		const userBodyweight = parseBodyweight();
		if (userBodyweight === null) {
			toast.error('Ingresá tu peso corporal');
			return null;
		}

		const workoutData: CreateWorkoutInput['workoutData'] = {
			startedAt,
			userBodyweight,
			note: note.trim() || undefined
		};

		if (workoutOfMesocycle) {
			workoutData.workoutOfMesocycle = {
				mesocycle: { id: workoutOfMesocycle.mesocycleId },
				splitDayIndex: workoutOfMesocycle.splitDayIndex,
				workoutStatus
			};
		}

		if (workoutStatus !== null) {
			return { workoutData, workoutExercises: [], workoutExercisesSets: [], workoutExercisesMiniSets: [] };
		}

		if (exercises.length === 0) {
			toast.error('Agregá al menos un ejercicio');
			return null;
		}

		const workoutExercises: CreateWorkoutInput['workoutExercises'] = [];
		const workoutExercisesSets: CreateWorkoutInput['workoutExercisesSets'] = [];
		const workoutExercisesMiniSets: CreateWorkoutInput['workoutExercisesMiniSets'] = [];

		for (const [exerciseIndex, exercise] of exercises.entries()) {
			if (!exercise.name.trim()) {
				toast.error(`El ejercicio ${exerciseIndex + 1} necesita un nombre`);
				return null;
			}
			if (exercise.sets.length === 0) {
				toast.error(`"${exercise.name}" necesita al menos una serie`);
				return null;
			}

			workoutExercises.push({
				exerciseIndex,
				name: exercise.name.trim(),
				targetMuscleGroup: exercise.targetMuscleGroup,
				customMuscleGroup: exercise.targetMuscleGroup === 'Custom' ? exercise.customMuscleGroup : null,
				bodyweightFraction: exercise.bodyweightFraction,
				setType: exercise.setType,
				changeType: exercise.changeType,
				changeAmount: exercise.changeAmount,
				repRangeStart: exercise.repRangeStart,
				repRangeEnd: exercise.repRangeEnd,
				note: exercise.note,
				overloadPercentage: exercise.overloadPercentage,
				lastSetToFailure: exercise.lastSetToFailure,
				forceRIRMatching: exercise.forceRIRMatching,
				minimumWeightChange: exercise.minimumWeightChange,
				topRepRangeStart: exercise.topRepRangeStart,
				topRepRangeEnd: exercise.topRepRangeEnd
			});

			const sets: CreateWorkoutInput['workoutExercisesSets'][number] = [];
			const miniSets: CreateWorkoutInput['workoutExercisesMiniSets'][number] = [];

			for (const [setIndex, set] of exercise.sets.entries()) {
				const reps = Number(set.reps);
				const load = Number(set.load);
				const RIR = Number(set.RIR);
				const isEmpty = !set.reps.trim() || !set.load.trim() || !set.RIR.trim();

				if (!set.skipped && (isEmpty || Number.isNaN(reps) || Number.isNaN(load) || Number.isNaN(RIR))) {
					toast.error(`Completá la serie ${setIndex + 1} de "${exercise.name}"`);
					return null;
				}

				sets.push({
					setIndex,
					reps: set.skipped ? 0 : Math.round(reps),
					load: set.skipped ? 0 : load,
					RIR: set.skipped ? 0 : Math.round(RIR),
					skipped: set.skipped
				});

				miniSets.push(
					set.skipped
						? []
						: set.miniSets.map((miniSet, miniSetIndex) => ({
								miniSetIndex,
								reps: Math.round(Number(miniSet.reps) || 0),
								load: Number(miniSet.load) || 0,
								RIR: Math.round(Number(miniSet.RIR) || 0)
							}))
				);
			}

			workoutExercisesSets.push(sets);
			workoutExercisesMiniSets.push(miniSets);
		}

		return { workoutData, workoutExercises, workoutExercisesSets, workoutExercisesMiniSets };
	}

	function submit(workoutStatus: 'RestDay' | 'Skipped' | null) {
		const input = buildInput(workoutStatus);
		if (!input) return;

		startTransition(async () => {
			const result = await createWorkoutAction(input);
			if (!result.ok) {
				toast.error(result.message);
				return;
			}
			toast.success(result.mesocycleCompleted ? '¡Mesociclo completado! 🎉' : result.message);
			router.push('/entrenamientos');
			router.refresh();
		});
	}

	if (!started) {
		return (
			<div className="flex flex-col gap-4">
				{workoutOfMesocycle && (
					<Card className="flex flex-col gap-2 p-5">
						<div className="flex flex-wrap items-center gap-1.5">
							<Badge variant={isRestDay ? 'secondary' : 'default'}>
								{isRestDay ? 'Día de descanso' : workoutOfMesocycle.splitDayName}
							</Badge>
							<Badge variant="outline">Ciclo {workoutOfMesocycle.cycleNumber}</Badge>
							{!isRestDay && workoutOfMesocycle.RIR !== null && (
								<Badge variant="outline">{workoutOfMesocycle.RIR} RIR</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground">{workoutOfMesocycle.mesocycleName}</p>
					</Card>
				)}

				<Card className="flex flex-col gap-4 p-5">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="bodyweight">Peso corporal (kg)</Label>
						<Input
							id="bodyweight"
							type="number"
							inputMode="decimal"
							min={1}
							step="0.1"
							value={bodyweight}
							onChange={(event) => setBodyweight(event.target.value)}
							placeholder="Por ejemplo 75"
						/>
						<p className="text-xs text-muted-foreground">
							Se usa para calcular el volumen de los ejercicios con peso corporal.
						</p>
					</div>

					<div className="flex flex-col gap-2 sm:flex-row">
						<Button onClick={start} disabled={isPending || isLoadingExercises} className="gap-1.5">
							{isLoadingExercises && <Loader2 className="size-4 animate-spin" />}
							{isRestDay ? 'Registrar descanso' : 'Empezar entrenamiento'}
						</Button>
						{isRestDay && (
							<Button variant="outline" disabled={isPending} onClick={() => submit('RestDay')}>
								Guardar día de descanso
							</Button>
						)}
						{workoutOfMesocycle && !isRestDay && (
							<Button variant="ghost" disabled={isPending} className="gap-1.5" onClick={() => submit('Skipped')}>
								<SkipForward className="size-4" />
								Saltear este día
							</Button>
						)}
					</div>
				</Card>
			</div>
		);
	}

	if (isRestDay) {
		return (
			<Card className="flex flex-col gap-4 p-5">
				<p className="text-sm text-muted-foreground">
					Hoy toca descansar. Guardá el día para que el mesociclo avance al siguiente entrenamiento.
				</p>
				<Button disabled={isPending} onClick={() => submit('RestDay')} className="w-fit">
					Guardar día de descanso
				</Button>
			</Card>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{workoutOfMesocycle && (
				<div className="flex flex-wrap items-center gap-1.5">
					<Badge>{workoutOfMesocycle.splitDayName}</Badge>
					<Badge variant="outline">Ciclo {workoutOfMesocycle.cycleNumber}</Badge>
					{workoutOfMesocycle.RIR !== null && <Badge variant="outline">{workoutOfMesocycle.RIR} RIR</Badge>}
				</div>
			)}

			{exercises.length === 0 && (
				<Card className="flex flex-col items-center gap-3 p-8 text-center">
					<p className="text-sm text-muted-foreground">Todavía no agregaste ejercicios a este entrenamiento.</p>
					<Button onClick={() => setPickerOpen(true)} className="gap-1.5">
						<Plus className="size-4" />
						Agregar ejercicio
					</Button>
				</Card>
			)}

			{exercises.map((exercise, exerciseIndex) => (
				<Card key={`${exercise.name}-${exerciseIndex}`} className="flex flex-col gap-3 p-5">
					<div className="flex items-start justify-between gap-3">
						<div className="flex min-w-0 flex-col">
							<p className="truncate font-semibold">{exercise.name}</p>
							<p className="text-xs text-muted-foreground">
								{muscleGroupName(exercise.targetMuscleGroup, exercise.customMuscleGroup)} ·{' '}
								{setTypeLabels[exercise.setType]} · {exercise.repRangeStart}-{exercise.repRangeEnd} reps
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="shrink-0 text-muted-foreground"
							onClick={() => setExercises((current) => current.filter((_, i) => i !== exerciseIndex))}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>

					{exercise.note && <p className="text-xs text-muted-foreground italic">{exercise.note}</p>}

					<div className="flex flex-col gap-2">
						<div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2rem] items-center gap-2 text-xs text-muted-foreground">
							<span>#</span>
							<span>Reps</span>
							<span>Carga</span>
							<span>RIR</span>
							<span />
						</div>

						{exercise.sets.map((set, setIndex) => (
							<div key={setIndex} className="flex flex-col gap-1">
								<div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2rem] items-center gap-2">
									<span className={cn('text-sm font-medium', set.skipped && 'text-muted-foreground line-through')}>
										{setIndex + 1}
									</span>
									<Input
										type="number"
										inputMode="numeric"
										value={set.reps}
										disabled={set.skipped}
										onChange={(event) => updateSet(exerciseIndex, setIndex, { reps: event.target.value })}
									/>
									<Input
										type="number"
										inputMode="decimal"
										step="0.5"
										value={set.load}
										disabled={set.skipped}
										onChange={(event) => updateSet(exerciseIndex, setIndex, { load: event.target.value })}
									/>
									<Input
										type="number"
										inputMode="numeric"
										value={set.RIR}
										disabled={set.skipped}
										onChange={(event) => updateSet(exerciseIndex, setIndex, { RIR: event.target.value })}
									/>
									<Button
										variant="ghost"
										size="icon"
										title={set.skipped ? 'Rehacer serie' : 'Saltear serie'}
										className={cn('text-muted-foreground', set.skipped && 'text-primary')}
										onClick={() => updateSet(exerciseIndex, setIndex, { skipped: !set.skipped })}
									>
										{set.skipped ? <Check className="size-4" /> : <SkipForward className="size-4" />}
									</Button>
								</div>

								{set.previous && !set.skipped && (
									<p className="pl-8 text-xs text-muted-foreground">Anterior: {set.previous}</p>
								)}

								{set.miniSets.map((miniSet, miniSetIndex) => (
									<div
										key={miniSetIndex}
										className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2rem] items-center gap-2 pl-4"
									>
										<span className="text-xs text-muted-foreground">{miniSetIndex + 1}</span>
										<Input
											type="number"
											inputMode="numeric"
											value={miniSet.reps}
											disabled={set.skipped}
											onChange={(event) =>
												updateMiniSet(exerciseIndex, setIndex, miniSetIndex, { reps: event.target.value })
											}
										/>
										<Input
											type="number"
											inputMode="decimal"
											step="0.5"
											value={miniSet.load}
											disabled={set.skipped}
											onChange={(event) =>
												updateMiniSet(exerciseIndex, setIndex, miniSetIndex, { load: event.target.value })
											}
										/>
										<Input
											type="number"
											inputMode="numeric"
											value={miniSet.RIR}
											disabled={set.skipped}
											onChange={(event) =>
												updateMiniSet(exerciseIndex, setIndex, miniSetIndex, { RIR: event.target.value })
											}
										/>
										<Button
											variant="ghost"
											size="icon"
											className="text-muted-foreground"
											onClick={() =>
												updateSet(exerciseIndex, setIndex, {
													miniSets: set.miniSets.filter((_, i) => i !== miniSetIndex)
												})
											}
										>
											<Minus className="size-4" />
										</Button>
									</div>
								))}

								{setTypesWithMiniSets.includes(exercise.setType) && !set.skipped && (
									<Button
										variant="ghost"
										size="sm"
										className="w-fit gap-1.5 pl-4 text-xs text-muted-foreground"
										onClick={() =>
											updateSet(exerciseIndex, setIndex, {
												miniSets: [...set.miniSets, { reps: '', load: set.load, RIR: '0' }]
											})
										}
									>
										<Plus className="size-3.5" />
										Mini serie
									</Button>
								)}
							</div>
						))}
					</div>

					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							className="gap-1.5"
							onClick={() =>
								updateExercise(exerciseIndex, {
									sets: [...exercise.sets, emptySet()]
								})
							}
						>
							<Plus className="size-3.5" />
							Serie
						</Button>
						{exercise.sets.length > 1 && (
							<Button
								variant="ghost"
								size="sm"
								className="gap-1.5 text-muted-foreground"
								onClick={() => updateExercise(exerciseIndex, { sets: exercise.sets.slice(0, -1) })}
							>
								<Minus className="size-3.5" />
								Quitar serie
							</Button>
						)}
					</div>
				</Card>
			))}

			{exercises.length > 0 && (
				<Button variant="outline" className="gap-1.5" onClick={() => setPickerOpen(true)}>
					<Plus className="size-4" />
					Agregar ejercicio
				</Button>
			)}

			<Card className="flex flex-col gap-4 p-5">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="workout-bodyweight">Peso corporal (kg)</Label>
					<Input
						id="workout-bodyweight"
						type="number"
						inputMode="decimal"
						step="0.1"
						value={bodyweight}
						onChange={(event) => setBodyweight(event.target.value)}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="workout-note">Nota (opcional)</Label>
					<Textarea
						id="workout-note"
						value={note}
						onChange={(event) => setNote(event.target.value)}
						placeholder="Cómo te sentiste, molestias, cambios de máquina…"
					/>
				</div>
			</Card>

			<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
				{workoutOfMesocycle && (
					<Button variant="ghost" disabled={isPending} className="gap-1.5" onClick={() => submit('Skipped')}>
						<SkipForward className="size-4" />
						Saltear este día
					</Button>
				)}
				<Button disabled={isPending} className="gap-1.5" onClick={() => submit(null)}>
					{isPending && <Loader2 className="size-4 animate-spin" />}
					Finalizar entrenamiento
				</Button>
			</div>

			<ExercisePicker
				open={pickerOpen}
				onOpenChange={setPickerOpen}
				onPick={(template) => setExercises((current) => [...current, exerciseFromTemplate(template)])}
			/>
		</div>
	);
}
