'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ExercisePicker } from '@/components/splits/exercise-picker';
import { saveExerciseSplitAction } from '@/lib/actions/splits';
import type { ExerciseSplitInput } from '@/lib/server/exerciseSplits';
import type { SplitExerciseTemplateWithoutIdsOrIndex } from '@/lib/types/exerciseTemplates';
import { muscleGroupLabels, muscleGroups, setTypeLabels, setTypes } from '@/lib/utils/labels';
import { cn } from '@/lib/utils';
import type { ChangeType, MuscleGroup, SetType } from '@prisma/client';

export type EditorExercise = SplitExerciseTemplateWithoutIdsOrIndex;
export type EditorDay = { name: string; isRestDay: boolean; exercises: EditorExercise[] };

const emptyExercise: EditorExercise = {
	name: '',
	targetMuscleGroup: 'Chest',
	customMuscleGroup: null,
	bodyweightFraction: null,
	setType: 'Straight',
	repRangeStart: 8,
	repRangeEnd: 12,
	changeType: null,
	changeAmount: null,
	note: null,
	topRepRangeStart: null,
	topRepRangeEnd: null
};

const setTypesWithChange: SetType[] = ['Drop', 'Down', 'MyorepMatchDown'];

function createDay(index: number): EditorDay {
	return { name: `Día ${index + 1}`, isRestDay: false, exercises: [] };
}

export function SplitEditor({
	editingId,
	initialName = '',
	initialDays
}: {
	editingId?: string;
	initialName?: string;
	initialDays?: EditorDay[];
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [name, setName] = useState(initialName);
	const [days, setDays] = useState<EditorDay[]>(initialDays?.length ? initialDays : [createDay(0)]);
	const [activeDay, setActiveDay] = useState(0);
	const [pickerOpen, setPickerOpen] = useState(false);
	const [expanded, setExpanded] = useState<number | null>(null);

	const day = days[activeDay];

	function updateDay(index: number, patch: Partial<EditorDay>) {
		setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
	}

	function updateExercise(exerciseIndex: number, patch: Partial<EditorExercise>) {
		setDays((prev) =>
			prev.map((d, i) =>
				i === activeDay
					? { ...d, exercises: d.exercises.map((ex, j) => (j === exerciseIndex ? { ...ex, ...patch } : ex)) }
					: d
			)
		);
	}

	function addDay() {
		setDays((prev) => [...prev, createDay(prev.length)]);
		setActiveDay(days.length);
	}

	function removeDay(index: number) {
		if (days.length === 1) {
			toast.error('El split necesita al menos un día');
			return;
		}
		setDays((prev) => prev.filter((_, i) => i !== index));
		setActiveDay((current) => Math.max(0, current >= index ? current - 1 : current));
	}

	function addExercise(exercise: EditorExercise) {
		setDays((prev) => prev.map((d, i) => (i === activeDay ? { ...d, exercises: [...d.exercises, exercise] } : d)));
		setExpanded(null);
	}

	function removeExercise(exerciseIndex: number) {
		setDays((prev) =>
			prev.map((d, i) => (i === activeDay ? { ...d, exercises: d.exercises.filter((_, j) => j !== exerciseIndex) } : d))
		);
		setExpanded(null);
	}

	function moveExercise(exerciseIndex: number, direction: -1 | 1) {
		const target = exerciseIndex + direction;
		if (target < 0 || target >= day.exercises.length) return;
		setDays((prev) =>
			prev.map((d, i) => {
				if (i !== activeDay) return d;
				const exercises = [...d.exercises];
				[exercises[exerciseIndex], exercises[target]] = [exercises[target], exercises[exerciseIndex]];
				return { ...d, exercises };
			})
		);
		setExpanded(null);
	}

	function validate(): string | null {
		if (!name.trim()) return 'Poné un nombre al split';
		if (days.some((d) => !d.name.trim())) return 'Todos los días necesitan un nombre';
		const trainingDays = days.filter((d) => !d.isRestDay);
		if (trainingDays.length === 0) return 'El split necesita al menos un día de entrenamiento';
		if (trainingDays.some((d) => d.exercises.length === 0)) return 'Todos los días de entrenamiento necesitan ejercicios';
		for (const trainingDay of trainingDays) {
			for (const exercise of trainingDay.exercises) {
				if (!exercise.name.trim()) return 'Todos los ejercicios necesitan un nombre';
				if (exercise.repRangeStart < 1 || exercise.repRangeEnd < exercise.repRangeStart) {
					return `Revisá el rango de repeticiones de "${exercise.name}"`;
				}
			}
		}
		return null;
	}

	function save() {
		const error = validate();
		if (error) {
			toast.error(error);
			return;
		}

		const input: ExerciseSplitInput = {
			splitName: name.trim(),
			splitDays: days.map((d, dayIndex) => ({ name: d.name.trim(), dayIndex, isRestDay: d.isRestDay })),
			splitExercises: days.map((d) =>
				d.isRestDay
					? []
					: d.exercises.map((exercise, exerciseIndex) => ({
							...exercise,
							name: exercise.name.trim(),
							note: exercise.note?.trim() || null,
							exerciseIndex
						}))
			)
		};

		startTransition(async () => {
			const result = await saveExerciseSplitAction(input, editingId);
			if (!result.ok) {
				toast.error(result.message);
				return;
			}
			toast.success(result.message);
			router.push('/splits');
		});
	}

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="split-name">Nombre del split</Label>
				<Input
					id="split-name"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder="Ej. Push Pull Legs"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label>Días</Label>
				<div className="flex flex-wrap items-center gap-1.5">
					{days.map((d, index) => (
						<button
							key={index}
							type="button"
							onClick={() => {
								setActiveDay(index);
								setExpanded(null);
							}}
							className={cn(
								'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
								index === activeDay
									? 'border-primary bg-primary text-primary-foreground'
									: 'border-border text-muted-foreground hover:bg-accent'
							)}
						>
							{d.name || `Día ${index + 1}`}
						</button>
					))}
					<Button type="button" variant="outline" size="sm" onClick={addDay} className="gap-1.5">
						<Plus className="size-3.5" />
						Día
					</Button>
				</div>
			</div>

			<Card className="flex flex-col gap-4 p-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
					<div className="flex flex-1 flex-col gap-1.5">
						<Label htmlFor="day-name">Nombre del día</Label>
						<Input
							id="day-name"
							value={day.name}
							onChange={(event) => updateDay(activeDay, { name: event.target.value })}
							placeholder="Ej. Empuje A"
						/>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant={day.isRestDay ? 'default' : 'outline'}
							onClick={() => updateDay(activeDay, { isRestDay: !day.isRestDay })}
						>
							{day.isRestDay ? 'Día de descanso' : 'Marcar descanso'}
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label="Eliminar día"
							onClick={() => removeDay(activeDay)}
						>
							<Trash2 className="size-4 text-destructive" />
						</Button>
					</div>
				</div>

				{day.isRestDay ? (
					<p className="rounded-lg bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
						Este día es de descanso, no lleva ejercicios.
					</p>
				) : (
					<div className="flex flex-col gap-2">
						{day.exercises.length === 0 && (
							<p className="rounded-lg bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
								Todavía no agregaste ejercicios a este día.
							</p>
						)}

						{day.exercises.map((exercise, exerciseIndex) => {
							const isOpen = expanded === exerciseIndex;
							return (
								<div key={exerciseIndex} className="rounded-lg border">
									<div className="flex items-center gap-2 p-2.5">
										<div className="flex flex-col">
											<button
												type="button"
												aria-label="Subir ejercicio"
												disabled={exerciseIndex === 0}
												onClick={() => moveExercise(exerciseIndex, -1)}
												className="text-muted-foreground disabled:opacity-30"
											>
												<ChevronUp className="size-3.5" />
											</button>
											<button
												type="button"
												aria-label="Bajar ejercicio"
												disabled={exerciseIndex === day.exercises.length - 1}
												onClick={() => moveExercise(exerciseIndex, 1)}
												className="text-muted-foreground disabled:opacity-30"
											>
												<ChevronDown className="size-3.5" />
											</button>
										</div>
										<button
											type="button"
											onClick={() => setExpanded(isOpen ? null : exerciseIndex)}
											className="flex min-w-0 flex-1 flex-col items-start text-left"
										>
											<span className="truncate text-sm font-medium">{exercise.name || 'Ejercicio sin nombre'}</span>
											<span className="text-xs text-muted-foreground">
												{exercise.targetMuscleGroup === 'Custom'
													? exercise.customMuscleGroup || 'Personalizado'
													: muscleGroupLabels[exercise.targetMuscleGroup]}{' '}
												· {exercise.repRangeStart}-{exercise.repRangeEnd} reps
											</span>
										</button>
										<Badge variant="secondary">{setTypeLabels[exercise.setType]}</Badge>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											aria-label="Quitar ejercicio"
											onClick={() => removeExercise(exerciseIndex)}
										>
											<Trash2 className="size-4 text-destructive" />
										</Button>
									</div>

									{isOpen && (
										<div className="grid gap-3 border-t p-3.5 sm:grid-cols-2">
											<div className="flex flex-col gap-1.5 sm:col-span-2">
												<Label>Nombre</Label>
												<Input
													value={exercise.name}
													onChange={(event) => updateExercise(exerciseIndex, { name: event.target.value })}
												/>
											</div>
											<div className="flex flex-col gap-1.5">
												<Label>Grupo muscular</Label>
												<Select
													value={exercise.targetMuscleGroup}
													onChange={(event) =>
														updateExercise(exerciseIndex, {
															targetMuscleGroup: event.target.value as MuscleGroup,
															customMuscleGroup: event.target.value === 'Custom' ? exercise.customMuscleGroup : null
														})
													}
												>
													{muscleGroups.map((group) => (
														<option key={group} value={group}>
															{muscleGroupLabels[group]}
														</option>
													))}
												</Select>
											</div>
											<div className="flex flex-col gap-1.5">
												<Label>Tipo de serie</Label>
												<Select
													value={exercise.setType}
													onChange={(event) => {
														const setType = event.target.value as SetType;
														updateExercise(exerciseIndex, {
															setType,
															changeType: setTypesWithChange.includes(setType)
																? (exercise.changeType ?? 'Percentage')
																: null,
															changeAmount: setTypesWithChange.includes(setType) ? (exercise.changeAmount ?? 10) : null,
															topRepRangeStart: setType === 'TopBackoff' ? (exercise.topRepRangeStart ?? 4) : null,
															topRepRangeEnd: setType === 'TopBackoff' ? (exercise.topRepRangeEnd ?? 6) : null
														});
													}}
												>
													{setTypes.map((type) => (
														<option key={type} value={type}>
															{setTypeLabels[type]}
														</option>
													))}
												</Select>
											</div>

											{exercise.targetMuscleGroup === 'Custom' && (
												<div className="flex flex-col gap-1.5 sm:col-span-2">
													<Label>Nombre del grupo muscular</Label>
													<Input
														value={exercise.customMuscleGroup ?? ''}
														onChange={(event) =>
															updateExercise(exerciseIndex, { customMuscleGroup: event.target.value || null })
														}
													/>
												</div>
											)}

											<div className="flex flex-col gap-1.5">
												<Label>Reps mínimas</Label>
												<Input
													type="number"
													min={1}
													value={exercise.repRangeStart}
													onChange={(event) =>
														updateExercise(exerciseIndex, { repRangeStart: Number(event.target.value) })
													}
												/>
											</div>
											<div className="flex flex-col gap-1.5">
												<Label>Reps máximas</Label>
												<Input
													type="number"
													min={1}
													value={exercise.repRangeEnd}
													onChange={(event) =>
														updateExercise(exerciseIndex, { repRangeEnd: Number(event.target.value) })
													}
												/>
											</div>

											{exercise.setType === 'TopBackoff' && (
												<>
													<div className="flex flex-col gap-1.5">
														<Label>Reps mínimas (top set)</Label>
														<Input
															type="number"
															min={1}
															value={exercise.topRepRangeStart ?? 4}
															onChange={(event) =>
																updateExercise(exerciseIndex, { topRepRangeStart: Number(event.target.value) })
															}
														/>
													</div>
													<div className="flex flex-col gap-1.5">
														<Label>Reps máximas (top set)</Label>
														<Input
															type="number"
															min={1}
															value={exercise.topRepRangeEnd ?? 6}
															onChange={(event) =>
																updateExercise(exerciseIndex, { topRepRangeEnd: Number(event.target.value) })
															}
														/>
													</div>
												</>
											)}

											{setTypesWithChange.includes(exercise.setType) && (
												<>
													<div className="flex flex-col gap-1.5">
														<Label>Tipo de cambio</Label>
														<Select
															value={exercise.changeType ?? 'Percentage'}
															onChange={(event) =>
																updateExercise(exerciseIndex, { changeType: event.target.value as ChangeType })
															}
														>
															<option value="Percentage">Porcentaje</option>
															<option value="AbsoluteLoad">Carga absoluta</option>
														</Select>
													</div>
													<div className="flex flex-col gap-1.5">
														<Label>Cantidad</Label>
														<Input
															type="number"
															min={0}
															step="0.5"
															value={exercise.changeAmount ?? 10}
															onChange={(event) =>
																updateExercise(exerciseIndex, { changeAmount: Number(event.target.value) })
															}
														/>
													</div>
												</>
											)}

											<div className="flex flex-col gap-1.5 sm:col-span-2">
												<Label>Peso corporal usado (opcional)</Label>
												<Input
													type="number"
													min={0}
													max={1}
													step="0.05"
													placeholder="Ej. 1 para dominadas, 0.65 para fondos"
													value={exercise.bodyweightFraction ?? ''}
													onChange={(event) =>
														updateExercise(exerciseIndex, {
															bodyweightFraction: event.target.value === '' ? null : Number(event.target.value)
														})
													}
												/>
											</div>

											<div className="flex flex-col gap-1.5 sm:col-span-2">
												<Label>Nota (opcional)</Label>
												<Textarea
													value={exercise.note ?? ''}
													onChange={(event) => updateExercise(exerciseIndex, { note: event.target.value || null })}
													placeholder="Técnica, seteo de la máquina, etc."
												/>
											</div>
										</div>
									)}
								</div>
							);
						})}

						<div className="flex flex-col gap-2 sm:flex-row">
							<Button type="button" variant="outline" onClick={() => setPickerOpen(true)} className="gap-1.5">
								<Plus className="size-4" />
								Agregar de la lista
							</Button>
							<Button
								type="button"
								variant="ghost"
								onClick={() => {
									addExercise({ ...emptyExercise });
									setExpanded(day.exercises.length);
								}}
								className="gap-1.5"
							>
								<GripVertical className="size-4" />
								Ejercicio personalizado
							</Button>
						</div>
					</div>
				)}
			</Card>

			<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
				<Button type="button" variant="ghost" onClick={() => router.push('/splits')} disabled={isPending}>
					Cancelar
				</Button>
				<Button type="button" onClick={save} disabled={isPending}>
					{isPending ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear split'}
				</Button>
			</div>

			<ExercisePicker
				open={pickerOpen}
				onOpenChange={setPickerOpen}
				onPick={(exercise) => addExercise({ ...emptyExercise, ...exercise })}
			/>
		</div>
	);
}
