'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/session';
import { QuotesDisplayModeSchema } from '@/lib/zodSchemas';

export async function getEntityCounts() {
	const userId = await requireUserId();
	const queryResult = await prisma.user.findUnique({
		where: { id: userId },
		select: { _count: { select: { exerciseSplits: true, mesocycles: true, workouts: true } } }
	});
	if (!queryResult) return null;

	const startedMesocycles = await prisma.mesocycle.count({ where: { userId, startDate: { not: null } } });
	return { ...queryResult._count, startedMesocycles };
}

export async function renameExercises(oldName: string, newName: string) {
	const userId = await requireUserId();
	const { count } = await prisma.workoutExercise.updateMany({
		where: { workout: { userId }, name: oldName },
		data: { name: newName }
	});
	return { count };
}

export async function getUserSettings() {
	const userId = await requireUserId();
	return prisma.userSettings.findUnique({
		where: { userId },
		select: { id: true, quotesDisplayModes: true, motivationalQuotesEnabled: true }
	});
}

const updateUserSettingsSchema = z.object({
	motivationalQuotesEnabled: z.boolean().optional(),
	quotesDisplayModes: z.array(QuotesDisplayModeSchema).min(1).optional()
});
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;

export async function updateUserSettings(input: UpdateUserSettingsInput) {
	const userId = await requireUserId();
	const parsed = updateUserSettingsSchema.parse(input);

	return prisma.userSettings.upsert({
		where: { userId },
		create: {
			userId,
			quotesDisplayModes: parsed.quotesDisplayModes ?? ['PRE_WORKOUT'],
			motivationalQuotesEnabled: parsed.motivationalQuotesEnabled ?? false
		},
		update: {
			...(parsed.motivationalQuotesEnabled !== undefined && { motivationalQuotesEnabled: parsed.motivationalQuotesEnabled }),
			...(parsed.quotesDisplayModes !== undefined && { quotesDisplayModes: parsed.quotesDisplayModes })
		},
		select: { id: true, quotesDisplayModes: true, motivationalQuotesEnabled: true }
	});
}
