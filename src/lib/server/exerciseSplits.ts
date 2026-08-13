'use server';

import { createId } from '@paralleldrive/cuid2';
import type { ExerciseSplit, ExerciseSplitDay, Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/session';
import {
	ExerciseSplitDayCreateWithoutExerciseSplitInputSchema,
	ExerciseTemplateCreateWithoutExerciseSplitDayInputSchema
} from '@/lib/zodSchemas';
import { findExerciseSplitByIdInclude } from './includes';

const zodExerciseSplitInput = z.strictObject({
	splitName: z.string(),
	splitDays: z.array(ExerciseSplitDayCreateWithoutExerciseSplitInputSchema),
	splitExercises: z.array(z.array(ExerciseTemplateCreateWithoutExerciseSplitDayInputSchema))
});

export type ExerciseSplitInput = z.infer<typeof zodExerciseSplitInput>;

async function createOrEditExerciseSplit(input: ExerciseSplitInput, userId: string, editingId?: string) {
	const exerciseSplitId = editingId ?? createId();
	const exerciseSplit: ExerciseSplit = { id: exerciseSplitId, name: input.splitName, userId };

	const exerciseSplitDays: ExerciseSplitDay[] = input.splitDays.map((splitDay) => ({
		...splitDay,
		id: createId(),
		exerciseSplitId: exerciseSplit.id
	}));

	const exerciseTemplates: Prisma.ExerciseTemplateUncheckedCreateInput[] = input.splitExercises.flatMap(
		(dayExercises, dayNumber) =>
			dayExercises.map((exercise) => ({
				...exercise,
				id: createId(),
				exerciseSplitDayId: exerciseSplitDays[dayNumber].id
			}))
	);

	const transactionQueries = [
		prisma.exerciseSplit.create({ data: exerciseSplit }),
		prisma.exerciseSplitDay.createMany({ data: exerciseSplitDays }),
		prisma.exerciseTemplate.createMany({ data: exerciseTemplates })
	];

	if (editingId) transactionQueries.unshift(prisma.exerciseSplit.delete({ where: { id: editingId, userId } }));

	await prisma.$transaction(transactionQueries);
}

export async function findExerciseSplitById(id: string) {
	const userId = await requireUserId();
	return prisma.exerciseSplit.findUnique({
		where: { id, userId },
		include: findExerciseSplitByIdInclude
	});
}

export async function loadExerciseSplits(input: { cursorId?: string; searchString?: string }) {
	const userId = await requireUserId();
	return prisma.exerciseSplit.findMany({
		where: { userId, name: { contains: input.searchString, mode: 'insensitive' } },
		orderBy: { id: 'desc' },
		include: { exerciseSplitDays: { orderBy: { dayIndex: 'asc' } } },
		cursor: input.cursorId !== undefined ? { id: input.cursorId } : undefined,
		skip: input.cursorId !== undefined ? 1 : 0,
		take: 10
	});
}

export async function loadAllExerciseSplitNames() {
	const userId = await requireUserId();
	return prisma.exerciseSplit.findMany({ where: { userId }, orderBy: { id: 'desc' } });
}

export async function createExerciseSplit(input: ExerciseSplitInput) {
	const userId = await requireUserId();
	const parsed = zodExerciseSplitInput.parse(input);
	await createOrEditExerciseSplit(parsed, userId);
	return { message: 'Split de ejercicios creado correctamente' };
}

export async function editExerciseSplitById(id: string, splitData: ExerciseSplitInput) {
	const userId = await requireUserId();
	const parsed = zodExerciseSplitInput.parse(splitData);
	await createOrEditExerciseSplit(parsed, userId, id);
	return { message: 'Split de ejercicios editado correctamente' };
}

export async function deleteExerciseSplitById(id: string) {
	const userId = await requireUserId();
	await prisma.exerciseSplit.delete({ where: { userId, id } });
	return { message: 'Split de ejercicios eliminado correctamente' };
}
