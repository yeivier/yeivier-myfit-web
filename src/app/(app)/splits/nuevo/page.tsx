'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SplitBuilder } from '@/components/splits/split-builder';
import { exerciseSplitTemplates } from '@/lib/common/exerciseSplitTemplates';
import { createExerciseSplit } from '@/lib/server/exerciseSplits';
import type { ExerciseSplitInput } from '@/lib/server/exerciseSplits';

export default function NewSplitPage() {
	const router = useRouter();
	const [mode, setMode] = useState<'choose' | 'scratch'>('choose');
	const [isPending, startTransition] = useTransition();

	function applyTemplate(templateIndex: number) {
		const template = exerciseSplitTemplates[templateIndex].exerciseSplit;
		const input: ExerciseSplitInput = {
			splitName: template.name as string,
			splitDays: template.exerciseSplitDays.map((day, dayIndex) => ({
				name: day.name as string,
				dayIndex,
				isRestDay: day.isRestDay as boolean
			})),
			splitExercises: template.exerciseSplitDays.map((day) =>
				day.exercises.map((exercise, exerciseIndex) => ({ ...exercise, exerciseIndex }))
			)
		};
		startTransition(async () => {
			await createExerciseSplit(input);
			router.push('/splits');
			router.refresh();
		});
	}

	if (mode === 'scratch') {
		return (
			<div className="flex flex-col gap-6">
				<h1 className="text-2xl font-bold">Nuevo split</h1>
				<SplitBuilder />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-bold">Nuevo split</h1>
			<div className="grid gap-4 sm:grid-cols-2">
				{exerciseSplitTemplates.map((t, i) => (
					<Card key={i} onClick={() => !isPending && applyTemplate(i)} className="cursor-pointer transition-colors hover:bg-accent">
						<CardHeader>
							<div className="mb-1 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
								<Sparkles className="size-4.5" />
							</div>
							<CardTitle>{t.exerciseSplit.name}</CardTitle>
							<CardDescription>{t.description}</CardDescription>
						</CardHeader>
					</Card>
				))}
				<Card onClick={() => setMode('scratch')} className="cursor-pointer transition-colors hover:bg-accent">
					<CardHeader>
						<div className="mb-1 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
							<PencilLine className="size-4.5" />
						</div>
						<CardTitle>Desde cero</CardTitle>
						<CardDescription>Armá tu split día por día, eligiendo cada ejercicio vos mismo.</CardDescription>
					</CardHeader>
				</Card>
			</div>
			{isPending && <p className="text-muted-foreground text-sm">Creando split...</p>}
			<Button variant="ghost" onClick={() => router.push('/splits')} type="button" className="self-start">
				Cancelar
			</Button>
		</div>
	);
}
