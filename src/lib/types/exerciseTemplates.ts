import type { Prisma } from '@prisma/client';

export type SplitExerciseTemplateWithoutIdsOrIndex = Omit<
	Prisma.ExerciseTemplateCreateWithoutExerciseSplitDayInput,
	'exerciseIndex'
>;
export type MesocycleExerciseTemplateWithoutIdsOrIndex = Omit<
	Prisma.MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInput,
	'exerciseIndex'
>;

export type ExerciseTemplateWithoutIdsOrIndex =
	| SplitExerciseTemplateWithoutIdsOrIndex
	| MesocycleExerciseTemplateWithoutIdsOrIndex;

export type FullExerciseSplitWithoutIdsOrIndex = Omit<Prisma.ExerciseSplitCreateWithoutUserInput, 'exerciseSplitDays'> & {
	exerciseSplitDays: (Omit<Prisma.ExerciseSplitDayCreateWithoutExerciseSplitInput, 'exercises' | 'dayIndex'> & {
		exercises: SplitExerciseTemplateWithoutIdsOrIndex[];
	})[];
};
