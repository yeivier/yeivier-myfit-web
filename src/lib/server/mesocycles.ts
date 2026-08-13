'use server';

import { createId } from '@paralleldrive/cuid2';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/session';
import {
	ExerciseSplitDayCreateWithoutExerciseSplitInputSchema,
	ExerciseSplitSchema,
	MesocycleCyclicSetChangeCreateWithoutMesocycleInputSchema,
	MesocycleExerciseSplitDayCreateWithoutMesocycleInputSchema,
	MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInputSchema,
	MesocycleUncheckedCreateWithoutUserInputSchema,
	MesocycleUpdateInputSchema
} from '@/lib/zodSchemas';
import { findMesocycleByIdInclude } from './includes';

const zodMesocycleCreateInput = z.strictObject({
	mesocycle: MesocycleUncheckedCreateWithoutUserInputSchema,
	mesocycleCyclicSetChanges: z.array(MesocycleCyclicSetChangeCreateWithoutMesocycleInputSchema),
	mesocycleExerciseTemplates: z.array(
		z.array(MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInputSchema)
	),
	exerciseSplit: ExerciseSplitSchema.extend({
		exerciseSplitDays: z.array(ExerciseSplitDayCreateWithoutExerciseSplitInputSchema)
	}),
	startImmediately: z.boolean()
});
export type MesocycleCreateInput = z.infer<typeof zodMesocycleCreateInput>;

const zodMesocycleEditInput = z.strictObject({
	mesocycle: MesocycleUpdateInputSchema,
	mesocycleCyclicSetChanges: z.array(MesocycleCyclicSetChangeCreateWithoutMesocycleInputSchema)
});
export type MesocycleEditInput = z.infer<typeof zodMesocycleEditInput>;

const zodUpdateExerciseSplitInput = z.strictObject({
	mesocycleExerciseSplitDays: z.array(MesocycleExerciseSplitDayCreateWithoutMesocycleInputSchema),
	mesocycleExerciseTemplates: z.array(
		z.array(MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInputSchema)
	),
	mesocycleId: z.string().cuid2()
});
export type UpdateMesocycleExerciseSplitInput = z.infer<typeof zodUpdateExerciseSplitInput>;

async function getActiveMesocycle(userId: string) {
	return prisma.mesocycle.findFirst({
		where: { userId, startDate: { not: null }, endDate: null },
		select: { name: true, id: true }
	});
}

export async function findMesocycleById(id: string) {
	const userId = await requireUserId();
	return prisma.mesocycle.findUnique({ where: { id, userId }, include: findMesocycleByIdInclude });
}

export async function findActiveMesocycle() {
	const userId = await requireUserId();
	return getActiveMesocycle(userId);
}

export async function loadMesocycles(input: { cursorId?: string; searchString?: string }) {
	const userId = await requireUserId();
	return prisma.mesocycle.findMany({
		where: { userId, name: { contains: input.searchString, mode: 'insensitive' } },
		orderBy: { id: 'desc' },
		cursor: input.cursorId !== undefined ? { id: input.cursorId } : undefined,
		skip: input.cursorId !== undefined ? 1 : 0,
		take: 10
	});
}

export async function createMesocycle(input: MesocycleCreateInput) {
	const userId = await requireUserId();
	const parsed = zodMesocycleCreateInput.parse(input);

	const mesocycle: Prisma.MesocycleUncheckedCreateInput = {
		id: createId(),
		userId,
		...parsed.mesocycle
	};

	if (parsed.startImmediately) {
		const activeMesocycle = await getActiveMesocycle(userId);
		if (activeMesocycle) throw new Error('Ya tenés un mesociclo activo');
		mesocycle.startDate = new Date();
	}

	const mesocycleCyclicSetChanges: Prisma.MesocycleCyclicSetChangeUncheckedCreateInput[] =
		parsed.mesocycleCyclicSetChanges.map((setChange) => ({
			...setChange,
			mesocycleId: mesocycle.id as string
		}));

	const mesocycleExerciseSplitDays: Prisma.MesocycleExerciseSplitDayUncheckedCreateInput[] =
		parsed.exerciseSplit.exerciseSplitDays.map((splitDay) => ({
			...splitDay,
			mesocycleId: mesocycle.id as string,
			id: createId()
		}));

	const mesocycleExerciseTemplates: Prisma.MesocycleExerciseTemplateUncheckedCreateInput[] =
		parsed.mesocycleExerciseTemplates.flatMap((dayExercises, dayNumber) =>
			dayExercises.map((exercise) => ({
				...exercise,
				mesocycleExerciseSplitDayId: mesocycleExerciseSplitDays[dayNumber].id as string
			}))
		);

	await prisma.$transaction([
		prisma.mesocycle.create({ data: mesocycle }),
		prisma.mesocycleCyclicSetChange.createMany({ data: mesocycleCyclicSetChanges }),
		prisma.mesocycleExerciseSplitDay.createMany({ data: mesocycleExerciseSplitDays }),
		prisma.mesocycleExerciseTemplate.createMany({ data: mesocycleExerciseTemplates })
	]);

	return { message: 'Mesociclo creado correctamente', id: mesocycle.id as string };
}

export async function editMesocycleById(id: string, mesocycleData: MesocycleEditInput) {
	const userId = await requireUserId();
	const parsed = zodMesocycleEditInput.parse(mesocycleData);

	await prisma.$transaction(async (tx) => {
		const mesocycle = await tx.mesocycle.update({
			where: { id, userId },
			data: { ...parsed.mesocycle },
			select: { id: true }
		});
		await tx.mesocycleCyclicSetChange.deleteMany({ where: { mesocycleId: mesocycle.id } });
		await tx.mesocycleCyclicSetChange.createMany({
			data: parsed.mesocycleCyclicSetChanges.map((setChange) => ({
				mesocycleId: mesocycle.id,
				...setChange
			}))
		});
	});
	return { message: 'Mesociclo editado correctamente' };
}

export async function deleteMesocycleById(id: string) {
	const userId = await requireUserId();
	await prisma.mesocycle.delete({ where: { userId, id } });
	return { message: 'Mesociclo eliminado correctamente' };
}

export async function progressMesocycleToNextStage(input: { id: string; startDate: Date | null; endDate: Date | null }) {
	const userId = await requireUserId();
	const now = new Date();
	let updateClause: Prisma.MesocycleUpdateInput;
	if (!input.startDate) updateClause = { startDate: now };
	else if (!input.endDate) updateClause = { endDate: now };
	else throw new Error('El mesociclo ya está completado');

	if (!input.startDate) {
		const activeMesocycle = await getActiveMesocycle(userId);
		if (activeMesocycle) throw new Error('Ya tenés un mesociclo activo');
	}

	const updatedMesocycle = await prisma.mesocycle.update({ where: { id: input.id, userId }, data: updateClause });
	return {
		message: `Mesociclo ${!input.startDate ? 'iniciado' : 'detenido'} correctamente`,
		startDate: updatedMesocycle.startDate,
		endDate: updatedMesocycle.endDate
	};
}

export async function updateMesocycleExerciseSplit(input: UpdateMesocycleExerciseSplitInput) {
	const userId = await requireUserId();
	const parsed = zodUpdateExerciseSplitInput.parse(input);

	const mesocycle = await prisma.mesocycle.findUniqueOrThrow({
		where: { id: parsed.mesocycleId, userId },
		select: { id: true }
	});

	const newSplitDaysIds = Array.from({ length: parsed.mesocycleExerciseSplitDays.length }).map(() => createId());

	await prisma.$transaction([
		prisma.mesocycleExerciseSplitDay.deleteMany({ where: { mesocycleId: mesocycle.id } }),
		prisma.mesocycleExerciseSplitDay.createMany({
			data: parsed.mesocycleExerciseSplitDays.map((splitDay, idx) => ({
				...splitDay,
				id: newSplitDaysIds[idx],
				mesocycleId: mesocycle.id
			}))
		}),
		prisma.mesocycleExerciseTemplate.createMany({
			data: parsed.mesocycleExerciseTemplates.flatMap((dayExercises, idx) =>
				dayExercises.map((exercise) => ({
					...exercise,
					mesocycleExerciseSplitDayId: newSplitDaysIds[idx]
				}))
			)
		})
	]);
	return { message: 'Split del mesociclo editado correctamente' };
}

export async function getMesocycleWorkouts(input: 'nextSplitDay' | 'allSplitDays') {
	const userId = await requireUserId();
	const includeClause = Prisma.validator<Prisma.WorkoutInclude>()({
		workoutExercises: { include: { sets: { include: { miniSets: true } } } }
	});

	if (input === 'allSplitDays') {
		return prisma.workout.findMany({ where: { userId }, include: includeClause });
	}

	const activeMesocycle = await prisma.mesocycle.findFirst({
		where: { userId, startDate: { not: null }, endDate: null },
		select: { id: true, _count: { select: { mesocycleExerciseSplitDays: true, workoutsOfMesocycle: true } } }
	});
	if (!activeMesocycle) return [];

	const totalWorkouts = activeMesocycle._count.workoutsOfMesocycle;
	const splitLength = activeMesocycle._count.mesocycleExerciseSplitDays;
	const splitDayIndex = totalWorkouts % splitLength;

	return prisma.workout.findMany({
		where: { workoutOfMesocycle: { mesocycleId: activeMesocycle.id, splitDayIndex }, userId },
		include: includeClause,
		orderBy: { startedAt: 'asc' }
	});
}
