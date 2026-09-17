import { notFound } from 'next/navigation';
import { findExerciseSplitById } from '@/lib/server/exerciseSplits';
import { SplitBuilder, type DayDraft } from '@/components/splits/split-builder';

export default async function EditSplitPage({ params }: PageProps<'/splits/[id]/editar'>) {
	const { id } = await params;
	const split = await findExerciseSplitById(id);
	if (!split) notFound();

	const days: DayDraft[] = split.exerciseSplitDays.map((day) => ({
		name: day.name,
		isRestDay: day.isRestDay,
		exercises: day.exercises.map((ex) => ({
			name: ex.name,
			targetMuscleGroup: ex.targetMuscleGroup,
			customMuscleGroup: ex.customMuscleGroup,
			bodyweightFraction: ex.bodyweightFraction,
			setType: ex.setType,
			repRangeStart: ex.repRangeStart,
			repRangeEnd: ex.repRangeEnd,
			changeType: ex.changeType,
			changeAmount: ex.changeAmount,
			note: ex.note
		}))
	}));

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-bold">Editar split</h1>
			<SplitBuilder splitId={split.id} initialName={split.name} initialDays={days} />
		</div>
	);
}
