'use server';

import { revalidatePath } from 'next/cache';
import {
	createMesocycle,
	deleteMesocycleById,
	progressMesocycleToNextStage,
	type MesocycleCreateInput
} from '@/lib/server/mesocycles';
import { findExerciseSplitById } from '@/lib/server/exerciseSplits';
import { actionErrorMessage, type ActionResult } from '@/lib/types/actions';

/** Split normalizado y listo para alimentar el formulario de un mesociclo nuevo. */
export async function loadSplitForMesocycleAction(id: string) {
	const split = await findExerciseSplitById(id);
	if (!split) return null;

	return {
		id: split.id,
		name: split.name,
		userId: split.userId,
		days: split.exerciseSplitDays.map((day) => ({
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
		}))
	};
}

export async function createMesocycleAction(
	input: MesocycleCreateInput
): Promise<ActionResult & { id?: string }> {
	try {
		const result = await createMesocycle(input);
		revalidatePath('/mesociclos');
		revalidatePath('/panel');
		return { ok: true, message: result.message, id: result.id };
	} catch (error) {
		return { ok: false, message: actionErrorMessage(error, 'No se pudo crear el mesociclo') };
	}
}

export async function progressMesocycleAction(
	id: string,
	startDate: Date | null,
	endDate: Date | null
): Promise<ActionResult> {
	try {
		const result = await progressMesocycleToNextStage({ id, startDate, endDate });
		revalidatePath('/mesociclos');
		revalidatePath('/panel');
		revalidatePath('/entrenamientos');
		return { ok: true, message: result.message };
	} catch (error) {
		return { ok: false, message: actionErrorMessage(error, 'No se pudo actualizar el mesociclo') };
	}
}

export async function deleteMesocycleAction(id: string): Promise<ActionResult> {
	try {
		const result = await deleteMesocycleById(id);
		revalidatePath('/mesociclos');
		revalidatePath('/panel');
		return { ok: true, message: result.message };
	} catch (error) {
		return { ok: false, message: actionErrorMessage(error, 'No se pudo eliminar el mesociclo') };
	}
}
