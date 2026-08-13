import { Prisma } from '@prisma/client';

/** Include completo de un mesociclo con datos de progresión (splits, sets cíclicos, entrenamientos con sets). */
export const createActiveMesocycleWithProgressionDataInclude = (splitDayIndex?: number) => {
	const workoutsWhere = splitDayIndex !== undefined ? { where: { splitDayIndex } } : {};

	return Prisma.validator<Prisma.MesocycleInclude>()({
		mesocycleExerciseSplitDays: {
			include: { mesocycleSplitDayExercises: { orderBy: { exerciseIndex: 'asc' } } },
			orderBy: { dayIndex: 'asc' }
		},
		mesocycleCyclicSetChanges: true,
		workoutsOfMesocycle: {
			include: {
				workout: {
					include: {
						workoutExercises: {
							include: {
								sets: { include: { miniSets: { orderBy: { miniSetIndex: 'asc' } } }, orderBy: { setIndex: 'asc' } }
							},
							orderBy: { exerciseIndex: 'asc' }
						}
					}
				}
			},
			orderBy: { workout: { startedAt: 'asc' } },
			...workoutsWhere
		}
	});
};

export type ActiveMesocycleWithProgressionData = Prisma.MesocycleGetPayload<{
	include: ReturnType<typeof createActiveMesocycleWithProgressionDataInclude>;
}>;

export const findMesocycleByIdInclude = Prisma.validator<Prisma.MesocycleInclude>()({
	exerciseSplit: true,
	mesocycleExerciseSplitDays: {
		include: { mesocycleSplitDayExercises: { orderBy: { exerciseIndex: 'asc' } } },
		orderBy: { dayIndex: 'asc' }
	},
	mesocycleCyclicSetChanges: true,
	workoutsOfMesocycle: {
		include: {
			workout: {
				include: {
					workoutExercises: { include: { sets: { include: { miniSets: true } } } }
				}
			}
		},
		orderBy: { workout: { startedAt: 'asc' } }
	}
});

export type FullMesocycle = Prisma.MesocycleGetPayload<{ include: typeof findMesocycleByIdInclude }>;
export type WorkoutsOfMesocycle = FullMesocycle['workoutsOfMesocycle'];
export type WorkoutWithExercises = WorkoutsOfMesocycle[number]['workout'];
export type WorkoutExerciseWithSets = WorkoutWithExercises['workoutExercises'][number];

export const findWorkoutByIdInclude = Prisma.validator<Prisma.WorkoutInclude>()({
	workoutOfMesocycle: {
		include: {
			mesocycle: {
				include: {
					mesocycleExerciseSplitDays: { select: { name: true }, orderBy: { dayIndex: 'asc' } }
				}
			}
		}
	},
	workoutExercises: {
		orderBy: { exerciseIndex: 'asc' },
		include: {
			sets: { include: { miniSets: { orderBy: { miniSetIndex: 'asc' } } }, orderBy: { setIndex: 'asc' } }
		}
	}
});

export type FullWorkout = Prisma.WorkoutGetPayload<{ include: typeof findWorkoutByIdInclude }>;

export const findExerciseSplitByIdInclude = Prisma.validator<Prisma.ExerciseSplitInclude>()({
	exerciseSplitDays: {
		include: { exercises: { orderBy: { exerciseIndex: 'asc' } } },
		orderBy: { dayIndex: 'asc' }
	}
});

export type FullExerciseSplit = Prisma.ExerciseSplitGetPayload<{ include: typeof findExerciseSplitByIdInclude }>;
