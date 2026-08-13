import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/app/page-header';
import { SplitEditor, type EditorDay } from '@/components/splits/split-editor';
import { findExerciseSplitById } from '@/lib/server/exerciseSplits';

export const metadata = { title: 'Editar split — MyFit' };

export default async function EditSplitPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const split = await findExerciseSplitById(id);
	if (!split) notFound();

	const days: EditorDay[] = split.exerciseSplitDays.map((day) => ({
		name: day.name,
		isRestDay: day.isRestDay,
		exercises: day.exercises.map((exercise) => ({
			name: exercise.name,
			targetMuscleGroup: exercise.targetMuscleGroup,
			customMuscleGroup: exercise.customMuscleGroup,
			bodyweightFraction: exercise.bodyweightFraction,
			setType: exercise.setType,
			repRangeStart: exercise.repRangeStart,
			repRangeEnd: exercise.repRangeEnd,
			changeType: exercise.changeType,
			changeAmount: exercise.changeAmount,
			note: exercise.note,
			topRepRangeStart: exercise.topRepRangeStart,
			topRepRangeEnd: exercise.topRepRangeEnd
		}))
	}));

	return (
		<div className="flex flex-col gap-6">
			<PageHeader title="Editar split" description={split.name} />
			<SplitEditor editingId={split.id} initialName={split.name} initialDays={days} />
		</div>
	);
}
