'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { createMesocycleAction, loadSplitForMesocycleAction } from '@/lib/actions/mesocycles';
import type { MesocycleCreateInput } from '@/lib/server/mesocycles';
import { muscleGroupLabels, muscleGroupName, muscleGroups } from '@/lib/utils/labels';
import type { MuscleGroup } from '@prisma/client';

type SplitOption = { id: string; name: string };
type LoadedSplit = NonNullable<Awaited<ReturnType<typeof loadSplitForMesocycleAction>>>;
type SetsByDay = number[][];

type CyclicSetChange = {
	muscleGroup: MuscleGroup;
	customMuscleGroup: string | null;
	regardlessOfProgress: boolean;
	setIncreaseAmount: number;
	maxVolume: number;
};

/** Semanas por nivel de RIR, de mayor a menor esfuerzo (índice = RIR). */
const defaultRIRProgression = [1, 2, 1, 0];

function CheckboxField({
	checked,
	onChange,
	label,
	hint
}: {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: string;
	hint?: string;
}) {
	return (
		<label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors hover:bg-accent/50">
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="mt-0.5 size-4 accent-primary"
			/>
			<span className="flex flex-col gap-0.5">
				<span className="text-sm font-medium">{label}</span>
				{hint && <span className="text-xs text-muted-foreground">{hint}</span>}
			</span>
		</label>
	);
}

export function MesocycleForm({ splits }: { splits: SplitOption[] }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isLoadingSplit, setIsLoadingSplit] = useState(false);

	const [name, setName] = useState('');
	const [splitId, setSplitId] = useState('');
	const [split, setSplit] = useState<LoadedSplit | null>(null);
	const [setsByDay, setSetsByDay] = useState<SetsByDay>([]);
	const [RIRProgression, setRIRProgression] = useState<number[]>(defaultRIRProgression);
	const [startOverloadPercentage, setStartOverloadPercentage] = useState(2.5);
	const [lastSetToFailure, setLastSetToFailure] = useState(true);
	const [forceRIRMatching, setForceRIRMatching] = useState(true);
	const [startImmediately, setStartImmediately] = useState(true);
	const [setChanges, setSetChanges] = useState<CyclicSetChange[]>([]);

	const totalCycles = RIRProgression.reduce((total, weeks) => total + weeks, 0);
	const totalWorkouts = split ? totalCycles * split.days.length : 0;

	function selectSplit(id: string) {
		setSplitId(id);
		setSplit(null);
		setSetsByDay([]);
		if (!id) return;

		setIsLoadingSplit(true);
		startTransition(async () => {
			const loaded = await loadSplitForMesocycleAction(id);
			setIsLoadingSplit(false);
			if (!loaded) {
				toast.error('No se pudo cargar el split');
				return;
			}
			setSplit(loaded);
			setSetsByDay(loaded.days.map((day) => day.exercises.map(() => 2)));
			if (!name.trim()) setName(`Mesociclo · ${loaded.name}`);
		});
	}

	function updateSets(dayIndex: number, exerciseIndex: number, sets: number) {
		setSetsByDay((prev) =>
			prev.map((day, i) => (i === dayIndex ? day.map((value, j) => (j === exerciseIndex ? sets : value)) : day))
		);
	}

	function submit() {
		if (!name.trim()) {
			toast.error('Poné un nombre al mesociclo');
			return;
		}
		if (!split) {
			toast.error('Elegí un split de ejercicios');
			return;
		}
		if (totalCycles < 1) {
			toast.error('El mesociclo necesita al menos una semana');
			return;
		}
		if (setsByDay.some((day) => day.some((sets) => sets < 1))) {
			toast.error('Cada ejercicio necesita al menos una serie');
			return;
		}
		if (setChanges.some((change) => change.muscleGroup === 'Custom' && !change.customMuscleGroup?.trim())) {
			toast.error('Poné un nombre a los grupos musculares personalizados');
			return;
		}

		const input: MesocycleCreateInput = {
			mesocycle: {
				name: name.trim(),
				exerciseSplitId: split.id,
				RIRProgression,
				startOverloadPercentage,
				lastSetToFailure,
				forceRIRMatching
			},
			mesocycleCyclicSetChanges: setChanges.map((change) => ({
				...change,
				customMuscleGroup: change.muscleGroup === 'Custom' ? change.customMuscleGroup : null
			})),
			mesocycleExerciseTemplates: split.days.map((day, dayIndex) =>
				day.exercises.map((exercise, exerciseIndex) => ({
					...exercise,
					exerciseIndex,
					sets: setsByDay[dayIndex][exerciseIndex]
				}))
			),
			exerciseSplit: {
				id: split.id,
				name: split.name,
				userId: split.userId,
				exerciseSplitDays: split.days.map((day, dayIndex) => ({
					name: day.name,
					dayIndex,
					isRestDay: day.isRestDay
				}))
			},
			startImmediately
		};

		startTransition(async () => {
			const result = await createMesocycleAction(input);
			if (!result.ok) {
				toast.error(result.message);
				return;
			}
			toast.success(result.message);
			router.push(result.id ? `/mesociclos/${result.id}` : '/mesociclos');
		});
	}

	return (
		<div className="flex flex-col gap-5">
			<Card className="flex flex-col gap-4 p-5">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="mesocycle-name">Nombre</Label>
					<Input
						id="mesocycle-name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="Ej. Volumen otoño"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="mesocycle-split">Split de ejercicios</Label>
					<Select id="mesocycle-split" value={splitId} onChange={(event) => selectSplit(event.target.value)}>
						<option value="">Elegí un split</option>
						{splits.map((option) => (
							<option key={option.id} value={option.id}>
								{option.name}
							</option>
						))}
					</Select>
					{isLoadingSplit && <p className="text-xs text-muted-foreground">Cargando ejercicios…</p>}
				</div>
			</Card>

			<Card className="flex flex-col gap-4 p-5">
				<div className="flex flex-col gap-1">
					<p className="font-semibold">Progresión de RIR</p>
					<p className="text-sm text-muted-foreground">
						Cuántas semanas entrenás a cada nivel de repeticiones en reserva. Se avanza de mayor a menor RIR.
					</p>
				</div>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{RIRProgression.map((weeks, rir) => (
						<div key={rir} className="flex flex-col gap-1.5">
							<Label htmlFor={`rir-${rir}`}>{rir} RIR</Label>
							<Input
								id={`rir-${rir}`}
								type="number"
								min={0}
								value={weeks}
								onChange={(event) =>
									setRIRProgression((prev) =>
										prev.map((value, index) => (index === rir ? Math.max(0, Number(event.target.value)) : value))
									)
								}
							/>
						</div>
					))}
				</div>
				<p className="text-sm text-muted-foreground">
					{totalCycles} {totalCycles === 1 ? 'semana' : 'semanas'}
					{split ? ` · ${totalWorkouts} entrenamientos en total` : ''}
				</p>
			</Card>

			{split && (
				<Card className="flex flex-col gap-4 p-5">
					<div className="flex flex-col gap-1">
						<p className="font-semibold">Series por ejercicio</p>
						<p className="text-sm text-muted-foreground">
							Con cuántas series arranca cada ejercicio. Después se ajustan solas con la progresión.
						</p>
					</div>
					{split.days.map((day, dayIndex) => (
						<div key={dayIndex} className="flex flex-col gap-2">
							<p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{day.name}</p>
							{day.isRestDay ? (
								<p className="text-sm text-muted-foreground">Día de descanso</p>
							) : (
								day.exercises.map((exercise, exerciseIndex) => (
									<div key={exerciseIndex} className="flex items-center gap-3">
										<div className="flex min-w-0 flex-1 flex-col">
											<span className="truncate text-sm font-medium">{exercise.name}</span>
											<span className="text-xs text-muted-foreground">
												{muscleGroupName(exercise.targetMuscleGroup, exercise.customMuscleGroup)} ·{' '}
												{exercise.repRangeStart}-{exercise.repRangeEnd} reps
											</span>
										</div>
										<Input
											type="number"
											min={1}
											aria-label={`Series de ${exercise.name}`}
											className="w-20"
											value={setsByDay[dayIndex]?.[exerciseIndex] ?? 2}
											onChange={(event) => updateSets(dayIndex, exerciseIndex, Number(event.target.value))}
										/>
									</div>
								))
							)}
						</div>
					))}
				</Card>
			)}

			<Card className="flex flex-col gap-4 p-5">
				<div className="flex flex-col gap-1">
					<p className="font-semibold">Progresión de carga</p>
					<p className="text-sm text-muted-foreground">Cómo se calcula el peso sugerido en cada entrenamiento.</p>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="overload">Sobrecarga inicial (%)</Label>
					<Input
						id="overload"
						type="number"
						min={0}
						step="0.5"
						value={startOverloadPercentage}
						onChange={(event) => setStartOverloadPercentage(Number(event.target.value))}
					/>
				</div>
				<CheckboxField
					checked={lastSetToFailure}
					onChange={setLastSetToFailure}
					label="Última serie al fallo"
					hint="La última serie de cada ejercicio se lleva a 0 RIR."
				/>
				<CheckboxField
					checked={forceRIRMatching}
					onChange={setForceRIRMatching}
					label="Forzar coincidencia de RIR"
					hint="Ajusta la carga para que el RIR real coincida con el planificado."
				/>
			</Card>

			<Card className="flex flex-col gap-4 p-5">
				<div className="flex flex-col gap-1">
					<p className="font-semibold">Progresión de series (opcional)</p>
					<p className="text-sm text-muted-foreground">
						Sumá series por grupo muscular a medida que avanzan las semanas.
					</p>
				</div>

				{setChanges.map((change, index) => (
					<div key={index} className="flex flex-col gap-3 rounded-lg border p-3.5">
						<div className="flex items-center gap-2">
							<Select
								aria-label="Grupo muscular"
								value={change.muscleGroup}
								onChange={(event) =>
									setSetChanges((prev) =>
										prev.map((item, i) =>
											i === index ? { ...item, muscleGroup: event.target.value as MuscleGroup } : item
										)
									)
								}
							>
								{muscleGroups.map((group) => (
									<option key={group} value={group}>
										{muscleGroupLabels[group]}
									</option>
								))}
							</Select>
							<Button
								variant="ghost"
								size="icon"
								aria-label="Quitar regla"
								onClick={() => setSetChanges((prev) => prev.filter((_, i) => i !== index))}
							>
								<Trash2 className="size-4 text-destructive" />
							</Button>
						</div>

						{change.muscleGroup === 'Custom' && (
							<Input
								placeholder="Nombre del grupo muscular"
								value={change.customMuscleGroup ?? ''}
								onChange={(event) =>
									setSetChanges((prev) =>
										prev.map((item, i) => (i === index ? { ...item, customMuscleGroup: event.target.value } : item))
									)
								}
							/>
						)}

						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1.5">
								<Label>Series a sumar</Label>
								<Input
									type="number"
									min={1}
									value={change.setIncreaseAmount}
									onChange={(event) =>
										setSetChanges((prev) =>
											prev.map((item, i) =>
												i === index ? { ...item, setIncreaseAmount: Number(event.target.value) } : item
											)
										)
									}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label>Volumen máximo</Label>
								<Input
									type="number"
									min={1}
									value={change.maxVolume}
									onChange={(event) =>
										setSetChanges((prev) =>
											prev.map((item, i) => (i === index ? { ...item, maxVolume: Number(event.target.value) } : item))
										)
									}
								/>
							</div>
						</div>

						<CheckboxField
							checked={change.regardlessOfProgress}
							onChange={(checked) =>
								setSetChanges((prev) =>
									prev.map((item, i) => (i === index ? { ...item, regardlessOfProgress: checked } : item))
								)
							}
							label="Sumar series aunque no haya progreso"
						/>
					</div>
				))}

				<Button
					variant="outline"
					className="w-fit gap-1.5"
					onClick={() =>
						setSetChanges((prev) => [
							...prev,
							{
								muscleGroup: 'Chest',
								customMuscleGroup: null,
								regardlessOfProgress: false,
								setIncreaseAmount: 1,
								maxVolume: 30
							}
						])
					}
				>
					<Plus className="size-4" />
					Agregar regla
				</Button>
			</Card>

			<Card className="p-5">
				<CheckboxField
					checked={startImmediately}
					onChange={setStartImmediately}
					label="Iniciar el mesociclo ahora"
					hint="Si lo dejás sin marcar, podés iniciarlo más tarde desde la lista de mesociclos."
				/>
			</Card>

			<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
				<Button variant="ghost" onClick={() => router.push('/mesociclos')} disabled={isPending}>
					Cancelar
				</Button>
				<Button onClick={submit} disabled={isPending}>
					{isPending ? 'Creando…' : 'Crear mesociclo'}
				</Button>
			</div>
		</div>
	);
}
