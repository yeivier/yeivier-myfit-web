'use server';

import { revalidatePath } from 'next/cache';
import { createWorkout, deleteWorkoutById, type CreateWorkoutInput } from '@/lib/server/workouts';
import { actionErrorMessage, type ActionResult } from '@/lib/types/actions';

function revalidateWorkoutPaths() {
	revalidatePath('/entrenamientos');
	revalidatePath('/panel');
	revalidatePath('/mesociclos');
	revalidatePath('/estadisticas');
}

export async function createWorkoutAction(
	input: CreateWorkoutInput
): Promise<ActionResult & { mesocycleCompleted?: boolean }> {
	try {
		const result = await createWorkout(input);
		revalidateWorkoutPaths();
		return { ok: true, message: result.message, mesocycleCompleted: result.mesocycleCompleted };
	} catch (error) {
		return { ok: false, message: actionErrorMessage(error, 'No se pudo guardar el entrenamiento') };
	}
}

export async function deleteWorkoutAction(id: string): Promise<ActionResult> {
	try {
		const result = await deleteWorkoutById(id);
		revalidateWorkoutPaths();
		return { ok: true, message: result.message };
	} catch (error) {
		return { ok: false, message: actionErrorMessage(error, 'No se pudo eliminar el entrenamiento') };
	}
}
