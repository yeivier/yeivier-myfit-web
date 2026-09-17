'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { ChangeType, MuscleGroup, SetType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { muscleGroupLabels, muscleGroups, setTypeLabels, setTypes } from '@/lib/constants/labels';
import { commonExercisePerMuscleGroup } from '@/lib/common/commonExercises';
import { createExerciseSplit, editExerciseSplitById } from '@/lib/server/exerciseSplits';
import type { ExerciseSplitInput } from '@/lib/server/exerciseSplits';

export type ExerciseDraft = Omit<ExerciseSplitInput['splitExercises'][number][number], 'exerciseIndex'>;
export type DayDraft = { name: string; isRestDay: boolean; exercises: ExerciseDraft[] };

function blankExercise(muscleGroup: MuscleGroup): ExerciseDraft {
	return {
		name: '',
		targetMuscleGroup: muscleGroup,
		customMuscleGroup: null,
		bodyweightFraction: null,
		setType: 'Straight',
		repRangeStart: 8,
		repRangeEnd: 12,
		changeType: null,
		changeAmount: null,
		note: null
	};
}

function blankDay(index: number): DayDraft {
	return { name: `Día ${index + 1}`, isRestDay: false, exercises: [] };
}

export function SplitBuilder({
	splitId,
	initialName,
	initialDays
}: {
	splitId?: string;
	initialName?: string;
	initialDays?: DayDraft[];
}) {
	const router = useRouter();
	const [name, setName] = useState(initialName ?? '');
	const [days, setDays] = useState<DayDraft[]>(initialDays ?? [blankDay(0)]);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function updateDay(dayIdx: number, patch: Partial<DayDraft>) {
		setDays((prev) => prev.map((d, i) => (i === dayIdx ? { ...d, ...patch } : d)));
	}

	function addDay() {
		setDays((prev) => [...prev, blankDay(prev.length)]);
	}

	function removeDay(dayIdx: number) {
		setDays((prev) => prev.filter((_, i) => i !== dayIdx));
	}

	function addExercise(dayIdx: number, muscleGroup: MuscleGroup, template?: ExerciseDraft) {
		setDays((prev) =>
			prev.map((d, i) =>
				i === dayIdx ? { ...d, exercises: [...d.exercises, template ?? blankExercise(muscleGroup)] } : d
			)
		);
	}

	function updateExercise(dayIdx: number, exIdx: number, patch: Partial<ExerciseDraft>) {
		setDays((prev) =>
			prev.map((d, i) =>
				i === dayIdx
					? { ...d, exercises: d.exercises.map((e, j) => (j === exIdx ? { ...e, ...patch } : e)) }
					: d
			)
		);
	}

	function removeExercise(dayIdx: number, exIdx: number) {
		setDays((prev) =>
			prev.map((d, i) => (i === dayIdx ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) } : d))
		);
	}

	function handleSubmit() {
		setError(null);
		if (!name.trim()) return setError('Ponele un nombre al split');
		if (days.length === 0) return setError('Agregá al menos un día');

		const input: ExerciseSplitInput = {
			splitName: name.trim(),
			splitDays: days.map((d, i) => ({ name: d.name.trim() || `Día ${i + 1}`, dayIndex: i, isRestDay: d.isRestDay })),
			splitExercises: days.map((d) =>
				d.isRestDay
					? []
					: d.exercises.map((e, exIdx) => ({ ...e, exerciseIndex: exIdx, name: e.name.trim() || 'Ejercicio' }))
			)
		};

		startTransition(async () => {
			try {
				if (splitId) await editExerciseSplitById(splitId, input);
				else await createExerciseSplit(input);
				router.push('/splits');
				router.refresh();
			} catch {
				setError('No se pudo guardar el split, probá de nuevo');
			}
		});
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<Label htmlFor="split-name">Nombre del split</Label>
				<Input id="split-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Push Pull Legs" />
			</div>

			<div className="flex flex-col gap-4">
				{days.map((day, dayIdx) => (
					<Card key={dayIdx}>
						<CardHeader className="flex-row items-center gap-3 pb-3">
							<GripVertical className="text-muted-foreground size-4 shrink-0" />
							<Input
								value={day.name}
								onChange={(e) => updateDay(dayIdx, { name: e.target.value })}
								className="h-9 flex-1"
							/>
							<label className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
								<input
									type="checkbox"
									checked={day.isRestDay}
									onChange={(e) => updateDay(dayIdx, { isRestDay: e.target.checked, exercises: [] })}
								/>
								Descanso
							</label>
							<Button variant="ghost" size="icon" onClick={() => removeDay(dayIdx)} type="button">
								<Trash2 className="text-destructive size-4" />
							</Button>
						</CardHeader>
						{!day.isRestDay && (
							<CardContent className="flex flex-col gap-3">
								{day.exercises.map((ex, exIdx) => (
									<div key={exIdx} className="bg-muted flex flex-col gap-2 rounded-[var(--radius-tile)] p-3">
										<div className="flex items-center gap-2">
											<Input
												value={ex.name}
												onChange={(e) => updateExercise(dayIdx, exIdx, { name: e.target.value })}
												placeholder="Nombre del ejercicio"
												className="h-9 flex-1 bg-transparent"
											/>
											<Button
												variant="ghost"
												size="icon"
												type="button"
												onClick={() => removeExercise(dayIdx, exIdx)}
											>
												<Trash2 className="text-destructive size-4" />
											</Button>
										</div>
										<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
											<Select
												value={ex.targetMuscleGroup}
												onChange={(e) =>
													updateExercise(dayIdx, exIdx, { targetMuscleGroup: e.target.value as MuscleGroup })
												}
												className="h-9 bg-transparent"
											>
												{muscleGroups.map((mg) => (
													<option key={mg} value={mg}>
														{muscleGroupLabels[mg]}
													</option>
												))}
											</Select>
											<Select
												value={ex.setType}
												onChange={(e) => updateExercise(dayIdx, exIdx, { setType: e.target.value as SetType })}
												className="h-9 bg-transparent"
											>
												{setTypes.map((st) => (
													<option key={st} value={st}>
														{setTypeLabels[st]}
													</option>
												))}
											</Select>
											<Input
												type="number"
												value={ex.repRangeStart}
												onChange={(e) =>
													updateExercise(dayIdx, exIdx, { repRangeStart: Number(e.target.value) })
												}
												className="h-9 bg-transparent"
												placeholder="Reps min"
											/>
											<Input
												type="number"
												value={ex.repRangeEnd}
												onChange={(e) => updateExercise(dayIdx, exIdx, { repRangeEnd: Number(e.target.value) })}
												className="h-9 bg-transparent"
												placeholder="Reps max"
											/>
										</div>
									</div>
								))}
								<ExercisePicker onPick={(muscleGroup, template) => addExercise(dayIdx, muscleGroup, template)} />
							</CardContent>
						)}
					</Card>
				))}
			</div>

			<Button variant="outline" type="button" onClick={addDay} className="gap-2">
				<Plus className="size-4" />
				Agregar día
			</Button>

			{error && <p className="text-destructive text-sm">{error}</p>}

			<Button onClick={handleSubmit} disabled={isPending} size="lg">
				{isPending ? 'Guardando...' : splitId ? 'Guardar cambios' : 'Crear split'}
			</Button>
		</div>
	);
}

function ExercisePicker({
	onPick
}: {
	onPick: (muscleGroup: MuscleGroup, template?: ExerciseDraft) => void;
}) {
	const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Chest');
	const options = commonExercisePerMuscleGroup.find((g) => g.muscleGroup === muscleGroup)?.exercises ?? [];

	return (
		<div className="flex flex-wrap items-center gap-2">
			<Select
				value={muscleGroup}
				onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
				className="h-9 w-auto min-w-36 bg-transparent"
			>
				{muscleGroups.map((mg) => (
					<option key={mg} value={mg}>
						{muscleGroupLabels[mg]}
					</option>
				))}
			</Select>
			{options.slice(0, 6).map((ex) => (
				<button
					key={ex.name}
					type="button"
					onClick={() =>
						onPick(muscleGroup, {
							...ex,
							changeType: (ex.changeType ?? null) as ChangeType | null,
							changeAmount: ex.changeAmount ?? null,
							bodyweightFraction: ex.bodyweightFraction ?? null,
							customMuscleGroup: ex.customMuscleGroup ?? null,
							note: ex.note ?? null
						})
					}
					className="border-input hover:bg-accent rounded-full border px-3 py-1.5 text-xs font-medium"
				>
					{ex.name}
				</button>
			))}
			<button
				type="button"
				onClick={() => onPick(muscleGroup)}
				className="border-input hover:bg-accent flex items-center gap-1 rounded-full border border-dashed px-3 py-1.5 text-xs font-medium"
			>
				<Plus className="size-3.5" />
				Personalizado
			</button>
		</div>
	);
}
