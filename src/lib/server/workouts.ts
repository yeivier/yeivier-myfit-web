'use server';

import { createId } from '@paralleldrive/cuid2';
import { Prisma, WorkoutStatus, type Mesocycle, type MesocycleExerciseSplitDay, type MuscleGroup, type WorkoutExercise, type WorkoutOfMesocycle } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/session';
import { arraySum } from '@/lib/utils';
import { progressiveOverloadMagic, type WorkoutExerciseInProgress, type WorkoutExerciseWithSets } from '@/lib/utils/workoutUtils';
import {
	WorkoutExerciseCreateWithoutWorkoutInputSchema,
	WorkoutExerciseMiniSetCreateWithoutParentSetInputSchema,
	WorkoutExerciseSetCreateWithoutWorkoutExerciseInputSchema
} from '@/lib/zodSchemas';
import { createActiveMesocycleWithProgressionDataInclude, findWorkoutByIdInclude, type ActiveMesocycleWithProgressionData } from './includes';

export type { ActiveMesocycleWithProgressionData };

type TodaysWorkoutData = {
	startedAt: Date | string;
	endedAt: Date | string | null;
	userBodyweight: number | null;
	workoutExercises: Pick<WorkoutExercise, 'name' | 'targetMuscleGroup' | 'customMuscleGroup'>[];
	workoutOfMesocycle?: Pick<WorkoutOfMesocycle, 'workoutStatus' | 'splitDayIndex'> & {
		mesocycle: Mesocycle;
		cycleNumber: number;
		splitDayName: string;
	};
	note: string | null;
	isLastWorkout: boolean;
};

type WorkoutExercisesWithPreviousData = {
	todaysWorkoutExercises: WorkoutExerciseInProgress[];
	previousWorkoutData: null | {
		exercises: WorkoutExerciseWithSets[];
		userBodyweight: number;
	};
};

const workoutInputDataSchema = z.object({
	startedAt: z.date().or(z.string().datetime()).optional(),
	userBodyweight: z.number(),
	workoutOfMesocycle: z
		.object({
			mesocycle: z.object({ id: z.string().cuid2() }),
			splitDayIndex: z.number().int(),
			workoutStatus: z.nativeEnum(WorkoutStatus).nullable()
		})
		.optional(),
	note: z.string().optional()
});

const createWorkoutSchema = z.strictObject({
	workoutData: workoutInputDataSchema,
	workoutExercises: z.array(WorkoutExerciseCreateWithoutWorkoutInputSchema),
	workoutExercisesSets: z.array(z.array(WorkoutExerciseSetCreateWithoutWorkoutExerciseInputSchema)),
	workoutExercisesMiniSets: z.array(z.array(z.array(WorkoutExerciseMiniSetCreateWithoutParentSetInputSchema)))
});
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export type LoadWorkoutsFilters = {
	startDate?: Date;
	endDate?: Date;
	selectedWorkoutStatuses?: ('RestDay' | 'Skipped' | null)[];
	selectedMesocycles?: (string | null)[];
};

export async function loadWorkouts(input: { cursorId?: string; filters?: LoadWorkoutsFilters }) {
	const userId = await requireUserId();
	let whereClause: Prisma.WorkoutWhereInput = { userId };
	const andConditions: Prisma.WorkoutWhereInput['AND'] = [];
	const { filters } = input;

	if (filters?.startDate) {
		whereClause = { ...whereClause, startedAt: { gte: filters.startDate } };
	}
	if (filters?.endDate) {
		const endDate = new Date(Number(filters.endDate) + 1000 * 60 * 60 * 24);
		whereClause = { ...whereClause, startedAt: { lte: endDate } };
	}
	if (filters?.selectedWorkoutStatuses) {
		const orClause: Prisma.WorkoutWhereInput['OR'] = [
			{ workoutOfMesocycle: { workoutStatus: { in: filters.selectedWorkoutStatuses.filter((m) => m !== null) } } }
		];
		if (filters.selectedWorkoutStatuses.includes(null)) {
			orClause.push({ workoutOfMesocycle: { workoutStatus: { equals: null } } });
			orClause.push({ workoutOfMesocycle: null });
		}
		andConditions.push({ OR: orClause });
	}
	if (filters?.selectedMesocycles) {
		const orClause: Prisma.WorkoutWhereInput['OR'] = [
			{ workoutOfMesocycle: { mesocycle: { name: { in: filters.selectedMesocycles.filter((m) => m !== null) } } } }
		];
		if (filters.selectedMesocycles.includes(null)) {
			orClause.push({ workoutOfMesocycle: null });
		}
		andConditions.push({ OR: orClause });
	}
	whereClause = { ...whereClause, AND: andConditions };

	return prisma.workout.findMany({
		where: whereClause,
		orderBy: { startedAt: 'desc' },
		include: {
			workoutOfMesocycle: {
				include: {
					mesocycle: {
						select: {
							id: true,
							name: true,
							mesocycleExerciseSplitDays: { select: { name: true }, orderBy: { dayIndex: 'asc' } }
						}
					}
				}
			}
		},
		cursor: input.cursorId !== undefined ? { id: input.cursorId } : undefined,
		skip: input.cursorId !== undefined ? 1 : 0,
		take: 10
	});
}

export async function getWorkoutFilterData() {
	const userId = await requireUserId();
	const firstWorkout = await prisma.workout.findFirst({
		where: { userId },
		select: { startedAt: true },
		orderBy: { startedAt: 'asc' }
	});
	if (!firstWorkout) return null;

	const lastWorkout = await prisma.workout.findFirst({
		where: { userId },
		select: { startedAt: true },
		orderBy: { startedAt: 'desc' }
	});

	const allMesocycles = await prisma.mesocycle.findMany({
		where: { userId },
		select: { name: true, startDate: true, endDate: true }
	});

	return { firstWorkoutDate: firstWorkout.startedAt, lastWorkoutDate: lastWorkout!.startedAt, allMesocycles };
}

export async function findWorkoutById(id: string) {
	const userId = await requireUserId();
	return prisma.workout.findUnique({ where: { id, userId }, include: findWorkoutByIdInclude });
}

export async function deleteWorkoutById(id: string) {
	const userId = await requireUserId();
	const workoutToDelete = await prisma.workout.findUniqueOrThrow({
		where: { userId, id },
		select: {
			workoutOfMesocycle: {
				select: {
					id: true,
					splitDayIndex: true,
					mesocycle: {
						select: { id: true, startDate: true, endDate: true, mesocycleExerciseSplitDays: { select: { name: true } } }
					}
				}
			}
		}
	});

	const mesocycle = workoutToDelete.workoutOfMesocycle?.mesocycle;
	if (mesocycle && mesocycle.startDate && mesocycle.endDate === null) {
		const wom = workoutToDelete.workoutOfMesocycle!;
		const workoutsOfMeso = await prisma.workout.findMany({
			where: { workoutOfMesocycle: { mesocycleId: mesocycle.id } },
			select: { workoutOfMesocycle: { select: { splitDayIndex: true } } }
		});

		const workoutsPerSplitDay: number[] = Array(mesocycle.mesocycleExerciseSplitDays.length).fill(0);
		workoutsOfMeso.forEach((w) => workoutsPerSplitDay[w.workoutOfMesocycle!.splitDayIndex]++);

		const maxSplitDayWorkouts = Math.max(...workoutsPerSplitDay);
		const lastSplitDayPerformed = workoutsPerSplitDay.findLastIndex((count) => count === maxSplitDayWorkouts);

		if (lastSplitDayPerformed !== wom.splitDayIndex) {
			throw new Error(
				`Solo podés eliminar el último entrenamiento del mesociclo activo: ${mesocycle.mesocycleExerciseSplitDays[lastSplitDayPerformed].name} (Día ${lastSplitDayPerformed + 1})`
			);
		}
	}

	await prisma.workout.delete({ where: { id, userId } });
	return { message: 'Entrenamiento eliminado correctamente' };
}

const activeMesocycleTodayDataInclude = Prisma.validator<Prisma.MesocycleInclude>()({
	mesocycleExerciseSplitDays: {
		include: {
			mesocycleSplitDayExercises: {
				select: { name: true, targetMuscleGroup: true, customMuscleGroup: true },
				orderBy: { exerciseIndex: 'asc' }
			}
		},
		orderBy: { dayIndex: 'asc' }
	},
	mesocycleCyclicSetChanges: true,
	workoutsOfMesocycle: { include: { workout: true }, orderBy: { workout: { startedAt: 'desc' } } }
});

export async function getTodaysWorkoutData(): Promise<TodaysWorkoutData> {
	const userId = await requireUserId();
	const data = await prisma.mesocycle.findFirst({
		where: { userId, startDate: { not: null }, endDate: null },
		include: activeMesocycleTodayDataInclude
	});
	const lastBodyweight = data?.workoutsOfMesocycle.map((wm) => wm.workout.userBodyweight)[0];
	const userBodyweight = lastBodyweight ?? null;

	const todaysWorkoutData: TodaysWorkoutData = {
		workoutExercises: [],
		userBodyweight,
		startedAt: new Date(),
		endedAt: null,
		note: null,
		isLastWorkout: false
	};

	if (data === null) return todaysWorkoutData;

	const { isRestDay, splitDayIndex, cycleNumber, todaysSplitDay, isLastWorkout } = getBasicDayInfo(
		data,
		data.workoutsOfMesocycle.length
	);
	const { mesocycleCyclicSetChanges, workoutsOfMesocycle, mesocycleExerciseSplitDays, ...mesocycleData } = data;

	todaysWorkoutData.workoutOfMesocycle = {
		mesocycle: mesocycleData,
		splitDayName: todaysSplitDay.name,
		workoutStatus: isRestDay ? 'RestDay' : null,
		cycleNumber,
		splitDayIndex
	};
	todaysWorkoutData.isLastWorkout = isLastWorkout;

	if (!isRestDay) {
		todaysWorkoutData.workoutExercises = todaysSplitDay.mesocycleSplitDayExercises.map((exercise) => ({
			name: exercise.name,
			targetMuscleGroup: exercise.targetMuscleGroup,
			customMuscleGroup: exercise.customMuscleGroup
		}));
	}
	return todaysWorkoutData;
}

export async function getSkippedWorkoutData(splitDayIndex: number): Promise<TodaysWorkoutData> {
	const userId = await requireUserId();
	const data = await prisma.mesocycle.findFirst({
		where: { userId, startDate: { not: null }, endDate: null },
		include: activeMesocycleTodayDataInclude
	});
	const lastBodyweight = data?.workoutsOfMesocycle.map((wm) => wm.workout.userBodyweight)[0];
	const userBodyweight = lastBodyweight ?? null;

	const todaysWorkoutData: TodaysWorkoutData = {
		workoutExercises: [],
		userBodyweight,
		startedAt: new Date(),
		endedAt: null,
		note: null,
		isLastWorkout: false
	};

	if (data === null) return todaysWorkoutData;

	const { isRestDay, cycleNumber, todaysSplitDay } = getBasicDayInfoForSkippedWorkout(
		data,
		data.workoutsOfMesocycle.length,
		splitDayIndex
	);
	const { mesocycleCyclicSetChanges, workoutsOfMesocycle, mesocycleExerciseSplitDays, ...mesocycleData } = data;

	todaysWorkoutData.workoutOfMesocycle = {
		mesocycle: mesocycleData,
		splitDayName: todaysSplitDay.name,
		workoutStatus: isRestDay ? 'RestDay' : null,
		cycleNumber,
		splitDayIndex
	};

	if (!isRestDay) {
		todaysWorkoutData.workoutExercises = todaysSplitDay.mesocycleSplitDayExercises.map((exercise) => ({
			name: exercise.name,
			targetMuscleGroup: exercise.targetMuscleGroup,
			customMuscleGroup: exercise.customMuscleGroup
		}));
	}
	return todaysWorkoutData;
}

export async function getSkippedWorkoutsOfCurrentCycle() {
	const userId = await requireUserId();
	const data = await prisma.mesocycle.findFirst({
		where: { userId, startDate: { not: null }, endDate: null },
		select: {
			mesocycleExerciseSplitDays: { select: { name: true }, orderBy: { dayIndex: 'asc' } },
			workoutsOfMesocycle: { select: { splitDayIndex: true, workoutStatus: true }, orderBy: { workout: { startedAt: 'desc' } } }
		}
	});
	if (data === null) return [];

	const { workoutsOfMesocycle, mesocycleExerciseSplitDays } = data;
	const currentCycleWorkouts = workoutsOfMesocycle.slice(0, workoutsOfMesocycle.length % mesocycleExerciseSplitDays.length);
	const skippedWorkouts = currentCycleWorkouts.filter((wm) => wm.workoutStatus === 'Skipped');
	return skippedWorkouts
		.map((workout) => ({ ...workout, splitDayName: mesocycleExerciseSplitDays[workout.splitDayIndex].name }))
		.toReversed();
}

export async function getWorkoutExercisesWithPreviousData(input: {
	userBodyweight: number;
	splitDayIndex: number;
}): Promise<WorkoutExercisesWithPreviousData> {
	const userId = await requireUserId();
	const { splitDayIndex } = input;
	const data: ActiveMesocycleWithProgressionData | null = await prisma.mesocycle.findFirst({
		where: { userId, startDate: { not: null }, endDate: null },
		include: createActiveMesocycleWithProgressionDataInclude(input.splitDayIndex)
	});

	const workoutExercisesWithPreviousData: WorkoutExercisesWithPreviousData = {
		todaysWorkoutExercises: [],
		previousWorkoutData: null
	};
	if (!data) return workoutExercisesWithPreviousData;

	const totalWorkouts = await prisma.workoutOfMesocycle.count({ where: { mesocycleId: data.id } });
	const { isRestDay, cycleNumber } = getBasicDayInfoForSkippedWorkout(data, totalWorkouts, splitDayIndex);
	if (isRestDay) return workoutExercisesWithPreviousData;

	workoutExercisesWithPreviousData.todaysWorkoutExercises = progressiveOverloadMagic(
		data,
		cycleNumber,
		input.userBodyweight,
		splitDayIndex
	);

	const previousWorkout = data.workoutsOfMesocycle.filter((wm) => wm.workoutStatus === null).at(-1)?.workout;
	if (previousWorkout) {
		workoutExercisesWithPreviousData.previousWorkoutData = {
			exercises: previousWorkout.workoutExercises,
			userBodyweight: previousWorkout.userBodyweight
		};
	}
	return workoutExercisesWithPreviousData;
}

export async function createWorkout(input: CreateWorkoutInput) {
	const userId = await requireUserId();
	const parsed = createWorkoutSchema.parse(input);

	const workout: Prisma.WorkoutUncheckedCreateInput = {
		id: createId(),
		userId,
		startedAt: parsed.workoutData.startedAt ?? new Date(),
		endedAt: new Date(),
		userBodyweight: parsed.workoutData.userBodyweight,
		note: parsed.workoutData.note
	};

	const { workoutOfMesocycle } = parsed.workoutData;
	if (workoutOfMesocycle) {
		workout.workoutOfMesocycle = {
			create: {
				mesocycleId: workoutOfMesocycle.mesocycle.id,
				splitDayIndex: workoutOfMesocycle.splitDayIndex,
				workoutStatus: workoutOfMesocycle.workoutStatus
			}
		};
	}

	const workoutExercises: Prisma.WorkoutExerciseUncheckedCreateInput[] = parsed.workoutExercises.map((ex) => ({
		...ex,
		workoutId: workout.id as string,
		id: createId()
	}));

	const workoutExercisesSets: Prisma.WorkoutExerciseSetUncheckedCreateInput[] = parsed.workoutExercisesSets.flatMap(
		(sets, exerciseIdx) => sets.map((set) => ({ ...set, id: createId(), workoutExerciseId: workoutExercises[exerciseIdx].id as string }))
	);

	let setIndex = 0;
	const workoutExercisesMiniSets: Prisma.WorkoutExerciseMiniSetUncheckedCreateInput[] = parsed.workoutExercisesMiniSets.flatMap(
		(sets) =>
			sets.flatMap((miniSets) => {
				const mapped = miniSets.map((miniSet) => ({ ...miniSet, workoutExerciseSetId: workoutExercisesSets[setIndex].id as string }));
				setIndex += 1;
				return mapped;
			})
	);

	const transactionQueries: Prisma.PrismaPromise<unknown>[] = [
		prisma.workout.create({ data: workout }),
		prisma.workoutExercise.createMany({ data: workoutExercises }),
		prisma.workoutExerciseSet.createMany({ data: workoutExercisesSets }),
		prisma.workoutExerciseMiniSet.createMany({ data: workoutExercisesMiniSets })
	];

	if (!workoutOfMesocycle) {
		await prisma.$transaction(transactionQueries);
		return { message: 'Entrenamiento creado correctamente', mesocycleCompleted: undefined as boolean | undefined };
	}

	const mesocycleData = await prisma.mesocycle.findFirst({
		where: { id: workoutOfMesocycle.mesocycle.id, userId },
		select: {
			RIRProgression: true,
			mesocycleExerciseSplitDays: { select: { id: true }, orderBy: { dayIndex: 'asc' } },
			workoutsOfMesocycle: { select: { workoutId: true, splitDayIndex: true }, orderBy: { workout: { startedAt: 'desc' } } }
		}
	});
	if (!mesocycleData) throw new Error('Mesociclo no encontrado');

	if (workoutOfMesocycle.workoutStatus === null) {
		const todaysSplitDay = mesocycleData.mesocycleExerciseSplitDays[workoutOfMesocycle.splitDayIndex];
		if (!todaysSplitDay) throw new Error('No se encontró el día de la rutina del mesociclo relacionado');

		transactionQueries.push(
			prisma.mesocycleExerciseTemplate.deleteMany({
				where: {
					mesocycleExerciseSplitDay: {
						dayIndex: workoutOfMesocycle.splitDayIndex,
						mesocycle: { id: workoutOfMesocycle.mesocycle.id, userId }
					}
				}
			}),
			prisma.mesocycleExerciseTemplate.createMany({
				data: workoutExercises.map((ex, exerciseIdx) => {
					const { workoutId, ...exercise } = ex;
					return { ...exercise, mesocycleExerciseSplitDayId: todaysSplitDay.id, sets: parsed.workoutExercisesSets[exerciseIdx].length };
				})
			})
		);
	}

	const currentCycleWorkouts = mesocycleData.workoutsOfMesocycle.slice(
		0,
		mesocycleData.workoutsOfMesocycle.length % mesocycleData.mesocycleExerciseSplitDays.length
	);
	const repeatOfSkippedWorkout = currentCycleWorkouts.find(
		(wm) => wm.splitDayIndex === parsed.workoutData.workoutOfMesocycle?.splitDayIndex
	);

	const totalWorkouts = arraySum(mesocycleData.RIRProgression) * mesocycleData.mesocycleExerciseSplitDays.length;
	const completedWorkouts = mesocycleData.workoutsOfMesocycle.length + 1;
	const mesocycleCompleted = completedWorkouts >= totalWorkouts;

	if (repeatOfSkippedWorkout) {
		transactionQueries.push(prisma.workout.delete({ where: { id: repeatOfSkippedWorkout.workoutId } }));
	} else if (mesocycleCompleted) {
		transactionQueries.push(
			prisma.mesocycle.update({ where: { id: workoutOfMesocycle.mesocycle.id, userId }, data: { endDate: new Date() } })
		);
	}

	await prisma.$transaction(transactionQueries);

	let message = 'Entrenamiento creado correctamente';
	if (workoutOfMesocycle?.workoutStatus === 'RestDay') message = 'Día de descanso completado correctamente';
	if (workoutOfMesocycle?.workoutStatus === 'Skipped') message = 'Entrenamiento omitido correctamente';
	return { message, mesocycleCompleted };
}

export async function editWorkoutById(id: string, data: CreateWorkoutInput, endedAt: Date | string) {
	const userId = await requireUserId();
	const parsed = createWorkoutSchema.parse(data);

	const workout: Prisma.WorkoutUncheckedCreateInput = {
		id,
		userId,
		startedAt: parsed.workoutData.startedAt!,
		endedAt,
		userBodyweight: parsed.workoutData.userBodyweight,
		note: parsed.workoutData.note
	};

	const workoutOfMesocycle = await prisma.workoutOfMesocycle.findFirst({ where: { workoutId: id } });

	const workoutExercises: Prisma.WorkoutExerciseUncheckedCreateInput[] = parsed.workoutExercises.map((ex) => ({
		...ex,
		workoutId: workout.id as string,
		id: createId()
	}));

	const workoutExercisesSets: Prisma.WorkoutExerciseSetUncheckedCreateInput[] = parsed.workoutExercisesSets.flatMap(
		(sets, exerciseIdx) => sets.map((set) => ({ ...set, id: createId(), workoutExerciseId: workoutExercises[exerciseIdx].id as string }))
	);

	let setIndex = 0;
	const workoutExercisesMiniSets: Prisma.WorkoutExerciseMiniSetUncheckedCreateInput[] = parsed.workoutExercisesMiniSets.flatMap(
		(sets) =>
			sets.flatMap((miniSets) => {
				const mapped = miniSets.map((miniSet) => ({ ...miniSet, workoutExerciseSetId: workoutExercisesSets[setIndex].id as string }));
				setIndex += 1;
				return mapped;
			})
	);

	await prisma.$transaction([
		prisma.workout.delete({ where: { id } }),
		prisma.workout.create({ data: workout }),
		prisma.workoutExercise.createMany({ data: workoutExercises }),
		prisma.workoutExerciseSet.createMany({ data: workoutExercisesSets }),
		prisma.workoutExerciseMiniSet.createMany({ data: workoutExercisesMiniSets }),
		...(workoutOfMesocycle ? [prisma.workoutOfMesocycle.create({ data: workoutOfMesocycle })] : [])
	]);
	return { message: 'Entrenamiento editado correctamente' };
}

export async function getExerciseHistory(input: { exerciseName: string; cursorId?: string }) {
	const userId = await requireUserId();
	return prisma.workoutExercise.findMany({
		where: { workout: { userId }, name: input.exerciseName },
		include: {
			workout: {
				select: {
					startedAt: true,
					userBodyweight: true,
					workoutOfMesocycle: {
						select: {
							splitDayIndex: true,
							mesocycle: { select: { name: true, mesocycleExerciseSplitDays: { select: { name: true }, orderBy: { dayIndex: 'asc' } } } }
						}
					}
				}
			},
			sets: { include: { miniSets: true }, orderBy: { setIndex: 'asc' } }
		},
		cursor: input.cursorId !== undefined ? { id: input.cursorId } : undefined,
		skip: input.cursorId !== undefined ? 1 : 0,
		take: 10,
		orderBy: { workout: { startedAt: 'desc' } }
	});
}

export async function getUserExercises(input: 'minimal' | 'extensive') {
	const userId = await requireUserId();
	const selectQuery: Prisma.WorkoutExerciseSelect | undefined =
		input === 'minimal' ? { name: true, targetMuscleGroup: true, customMuscleGroup: true } : undefined;

	return prisma.workoutExercise.findMany({
		where: { workout: { userId } },
		distinct: ['name'],
		orderBy: { workout: { startedAt: 'desc' } },
		select: selectQuery
	});
}

function getBasicDayInfo(
	mesocycleData: {
		mesocycleExerciseSplitDays: (MesocycleExerciseSplitDay & {
			mesocycleSplitDayExercises: { name: string; targetMuscleGroup: MuscleGroup; customMuscleGroup: string | null }[];
		})[];
		RIRProgression: number[];
	},
	totalWorkouts: number
) {
	const { mesocycleExerciseSplitDays } = mesocycleData;
	const splitLength = mesocycleExerciseSplitDays.length;
	const todaysSplitDay = mesocycleExerciseSplitDays[totalWorkouts % splitLength];
	const isRestDay = todaysSplitDay.isRestDay;
	const splitDayIndex = totalWorkouts % splitLength;
	const cycleNumber = 1 + Math.floor(totalWorkouts / splitLength);
	const isLastWorkout = totalWorkouts === arraySum(mesocycleData.RIRProgression) * splitLength - 1;
	return { isRestDay, splitDayIndex, cycleNumber, todaysSplitDay, isLastWorkout };
}

function getBasicDayInfoForSkippedWorkout(
	mesocycleData: {
		mesocycleExerciseSplitDays: (MesocycleExerciseSplitDay & {
			mesocycleSplitDayExercises: { name: string; targetMuscleGroup: MuscleGroup; customMuscleGroup: string | null }[];
		})[];
		workoutsOfMesocycle: WorkoutOfMesocycle[];
	},
	totalWorkouts: number,
	skippedWorkoutIndex: number
) {
	const { mesocycleExerciseSplitDays } = mesocycleData;
	const splitLength = mesocycleExerciseSplitDays.length;
	const todaysSplitDay = mesocycleExerciseSplitDays[skippedWorkoutIndex];
	const isRestDay = todaysSplitDay.isRestDay;
	const cycleNumber = 1 + Math.floor(totalWorkouts / splitLength);
	return { isRestDay, cycleNumber, todaysSplitDay };
}
