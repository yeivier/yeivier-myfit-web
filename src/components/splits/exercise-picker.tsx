'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { commonExercisePerMuscleGroup } from '@/lib/common/commonExercises';
import type { SplitExerciseTemplateWithoutIdsOrIndex } from '@/lib/types/exerciseTemplates';
import { muscleGroupLabels } from '@/lib/utils/labels';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onPick: (exercise: SplitExerciseTemplateWithoutIdsOrIndex) => void;
};

/** Buscador de ejercicios frecuentes, agrupados por grupo muscular. */
export function ExercisePicker({ open, onOpenChange, onPick }: Props) {
	const [search, setSearch] = useState('');

	const groups = useMemo(() => {
		const term = search.trim().toLowerCase();
		return commonExercisePerMuscleGroup
			.map((group) => ({
				...group,
				exercises: term ? group.exercises.filter((ex) => ex.name.toLowerCase().includes(term)) : group.exercises
			}))
			.filter((group) => group.exercises.length > 0);
	}, [search]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Agregar ejercicio</DialogTitle>
					<DialogDescription>Elegí uno de la lista o creá uno propio desde el formulario.</DialogDescription>
				</DialogHeader>

				<div className="relative">
					<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						autoFocus
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Buscar ejercicio"
						className="pl-9"
					/>
				</div>

				<div className="-mx-1 flex max-h-[50vh] flex-col gap-4 overflow-y-auto px-1">
					{groups.length === 0 && (
						<p className="py-6 text-center text-sm text-muted-foreground">No encontramos ejercicios con ese nombre</p>
					)}
					{groups.map((group) => (
						<div key={group.muscleGroup} className="flex flex-col gap-1">
							<p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
								{muscleGroupLabels[group.muscleGroup]}
							</p>
							{group.exercises.map((exercise) => (
								<button
									key={`${group.muscleGroup}-${exercise.name}`}
									type="button"
									onClick={() => {
										onPick(exercise);
										onOpenChange(false);
										setSearch('');
									}}
									className="rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
								>
									{exercise.name}
									<span className="block text-xs text-muted-foreground">
										{exercise.repRangeStart}-{exercise.repRangeEnd} reps
									</span>
								</button>
							))}
						</div>
					))}
				</div>

				<Button variant="ghost" onClick={() => onOpenChange(false)}>
					Cancelar
				</Button>
			</DialogContent>
		</Dialog>
	);
}
