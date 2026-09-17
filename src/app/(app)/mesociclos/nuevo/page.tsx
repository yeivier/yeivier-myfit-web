'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { findExerciseSplitById, loadAllExerciseSplitNames } from '@/lib/server/exerciseSplits';
import { createMesocycle } from '@/lib/server/mesocycles';
import type { MesocycleCreateInput } from '@/lib/server/mesocycles';
import type { FullExerciseSplit } from '@/lib/server/includes';

type SplitSummary = Awaited<ReturnType<typeof loadAllExerciseSplitNames>>[number];

function defaultRIRProgression(weeks: number): number[] {
	// Baja de RIR más alto a 0 (última semana), y una semana final de descarga (RIR 4).
	const ramp = Array.from({ length: Math.max(weeks - 1, 1) }, (_, i) =>
		Math.max(4 - Math.round((i * 4) / Math.max(weeks - 2, 1)), 0)
	);
	return [...ramp, 4];
}

function NewMesocycleForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const preselectedSplitId = searchParams.get('splitId');

	const [splits, setSplits] = useState<SplitSummary[] | null>(null);
	const [splitId, setSplitId] = useState<string | null>(preselectedSplitId);
	const [split, setSplit] = useState<FullExerciseSplit | null>(null);
	const [sets, setSets] = useState<Record<string, number>>({});

	const [name, setName] = useState('');
	const [weeks, setWeeks] = useState(6);
	const [overloadPercentage, setOverloadPercentage] = useState(2.5);
	const [lastSetToFailure, setLastSetToFailure] = useState(false);
	const [forceRIRMatching, setForceRIRMatching] = useState(false);
	const [startImmediately, setStartImmediately] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		if (!splitId) loadAllExerciseSplitNames().then(setSplits);
	}, [splitId]);

	useEffect(() => {
		if (!splitId) return;
		findExerciseSplitById(splitId).then((s) => {
			setSplit(s);
			if (s && !name) setName(s.name);
			if (s) {
				const initialSets: Record<string, number> = {};
				for (const day of s.exerciseSplitDays) for (const ex of day.exercises) initialSets[ex.id] = 3;
				setSets(initialSets);
			}
		});
	}, [splitId]); // eslint-disable-line react-hooks/exhaustive-deps

	if (!splitId) {
		return (
			<div className="flex flex-col gap-4">
				<p className="text-muted-foreground text-sm">Elegí el split del que va a partir este mesociclo.</p>
				{splits === null ? (
					<p className="text-muted-foreground text-sm">Cargando...</p>
				) : splits.length === 0 ? (
					<Card>
						<CardHeader>
							<CardTitle>Todavía no tenés ningún split</CardTitle>
							<CardDescription>Creá uno primero para poder armar un mesociclo.</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild>
								<Link href="/splits/nuevo">Crear split</Link>
							</Button>
						</CardContent>
					</Card>
				) : (
					splits.map((s) => (
						<Card key={s.id} onClick={() => setSplitId(s.id)} className="cursor-pointer transition-colors hover:bg-accent">
							<CardHeader>
								<CardTitle>{s.name}</CardTitle>
							</CardHeader>
						</Card>
					))
				)}
			</div>
		);
	}

	if (!split) return <p className="text-muted-foreground text-sm">Cargando split...</p>;

	function handleSubmit() {
		if (!split) return;
		setError(null);
		if (!name.trim()) return setError('Ponele un nombre al mesociclo');

		const input: MesocycleCreateInput = {
			mesocycle: {
				name: name.trim(),
				exerciseSplitId: split.id,
				RIRProgression: defaultRIRProgression(weeks),
				startOverloadPercentage: overloadPercentage / 100,
				lastSetToFailure,
				forceRIRMatching
			},
			mesocycleCyclicSetChanges: [],
			exerciseSplit: {
				id: split.id,
				name: split.name,
				userId: split.userId,
				exerciseSplitDays: split.exerciseSplitDays.map((day) => ({
					name: day.name,
					dayIndex: day.dayIndex,
					isRestDay: day.isRestDay
				}))
			},
			mesocycleExerciseTemplates: split.exerciseSplitDays.map((day) =>
				day.exercises.map((ex, exerciseIndex) => ({
					name: ex.name,
					exerciseIndex,
					targetMuscleGroup: ex.targetMuscleGroup,
					customMuscleGroup: ex.customMuscleGroup,
					bodyweightFraction: ex.bodyweightFraction,
					sets: sets[ex.id] ?? 3,
					setType: ex.setType,
					repRangeStart: ex.repRangeStart,
					repRangeEnd: ex.repRangeEnd,
					changeType: ex.changeType,
					changeAmount: ex.changeAmount,
					note: ex.note,
					topRepRangeStart: ex.topRepRangeStart,
					topRepRangeEnd: ex.topRepRangeEnd
				}))
			),
			startImmediately
		};

		startTransition(async () => {
			try {
				const result = await createMesocycle(input);
				router.push(`/mesociclos/${result.id}`);
				router.refresh();
			} catch (e) {
				setError(e instanceof Error ? e.message : 'No se pudo crear el mesociclo');
			}
		});
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<Label htmlFor="meso-name">Nombre</Label>
				<Input id="meso-name" value={name} onChange={(e) => setName(e.target.value)} />
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="weeks">Semanas</Label>
					<Input id="weeks" type="number" min={2} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} />
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="overload">Overload por semana (%)</Label>
					<Input
						id="overload"
						type="number"
						step="0.5"
						value={overloadPercentage}
						onChange={(e) => setOverloadPercentage(Number(e.target.value))}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<label className="flex items-center gap-2 text-sm">
					<input type="checkbox" checked={lastSetToFailure} onChange={(e) => setLastSetToFailure(e.target.checked)} />
					Última serie al fallo
				</label>
				<label className="flex items-center gap-2 text-sm">
					<input type="checkbox" checked={forceRIRMatching} onChange={(e) => setForceRIRMatching(e.target.checked)} />
					Forzar coincidencia de RIR
				</label>
				<label className="flex items-center gap-2 text-sm">
					<input type="checkbox" checked={startImmediately} onChange={(e) => setStartImmediately(e.target.checked)} />
					Empezar ahora mismo
				</label>
			</div>

			<div className="flex flex-col gap-3">
				<h2 className="text-sm font-semibold">Series por ejercicio</h2>
				{split.exerciseSplitDays.map((day) => (
					<Card key={day.id}>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">{day.name}</CardTitle>
						</CardHeader>
						{!day.isRestDay && (
							<CardContent className="flex flex-col gap-2">
								{day.exercises.map((ex) => (
									<div key={ex.id} className="flex items-center justify-between gap-2 text-sm">
										<span>{ex.name}</span>
										<Input
											type="number"
											min={1}
											value={sets[ex.id] ?? 3}
											onChange={(e) => setSets((prev) => ({ ...prev, [ex.id]: Number(e.target.value) }))}
											className="h-8 w-16"
										/>
									</div>
								))}
							</CardContent>
						)}
					</Card>
				))}
			</div>

			{error && <p className="text-destructive text-sm">{error}</p>}

			<Button size="lg" onClick={handleSubmit} disabled={isPending}>
				{isPending ? 'Creando...' : 'Crear mesociclo'}
			</Button>
		</div>
	);
}

export default function NewMesocyclePage() {
	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-bold">Nuevo mesociclo</h1>
			<Suspense fallback={<p className="text-muted-foreground text-sm">Cargando...</p>}>
				<NewMesocycleForm />
			</Suspense>
		</div>
	);
}
