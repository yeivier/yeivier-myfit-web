'use client';

import { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SplitEditor, type EditorDay } from '@/components/splits/split-editor';
import { exerciseSplitTemplates } from '@/lib/common/exerciseSplitTemplates';

type Choice = { name: string; days: EditorDay[] } | null;

export function NewSplitFlow() {
	const [choice, setChoice] = useState<Choice>(null);

	if (choice) {
		return (
			<div className="flex flex-col gap-4">
				<Button variant="ghost" size="sm" className="w-fit gap-1.5" onClick={() => setChoice(null)}>
					<ArrowLeft className="size-3.5" />
					Elegir otra plantilla
				</Button>
				<SplitEditor initialName={choice.name} initialDays={choice.days} />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<Card
				role="button"
				tabIndex={0}
				onClick={() => setChoice({ name: '', days: [{ name: 'Día 1', isRestDay: false, exercises: [] }] })}
				onKeyDown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						setChoice({ name: '', days: [{ name: 'Día 1', isRestDay: false, exercises: [] }] });
					}
				}}
				className="cursor-pointer p-5 transition-colors hover:bg-accent/50"
			>
				<p className="font-semibold">Empezar desde cero</p>
				<p className="text-sm text-muted-foreground">Armá tus días y elegí los ejercicios uno por uno.</p>
			</Card>

			<p className="mt-2 text-sm font-semibold text-muted-foreground">O empezá con una plantilla</p>

			{exerciseSplitTemplates.map((template) => (
				<Card
					key={template.exerciseSplit.name}
					role="button"
					tabIndex={0}
					onClick={() =>
						setChoice({
							name: template.exerciseSplit.name,
							days: template.exerciseSplit.exerciseSplitDays.map((day) => ({
								name: day.name,
								isRestDay: day.isRestDay,
								exercises: day.exercises.map((exercise) => ({ ...exercise }))
							}))
						})
					}
					className="cursor-pointer p-5 transition-colors hover:bg-accent/50"
				>
					<div className="flex items-center gap-2">
						<Sparkles className="size-4 text-primary" />
						<p className="font-semibold">{template.exerciseSplit.name}</p>
					</div>
					<p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
					<p className="mt-2 text-xs text-muted-foreground">
						{template.exerciseSplit.exerciseSplitDays.length} días ·{' '}
						{template.exerciseSplit.exerciseSplitDays.filter((day) => !day.isRestDay).length} de entrenamiento
					</p>
				</Card>
			))}
		</div>
	);
}
