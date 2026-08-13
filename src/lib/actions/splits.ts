'use server';

import { revalidatePath } from 'next/cache';
import {
	createExerciseSplit,
	deleteExerciseSplitById,
	editExerciseSplitById,
	type ExerciseSplitInput
} from '@/lib/server/exerciseSplits';
import { actionErrorMessage, type ActionResult } from '@/lib/types/actions';

export async function saveExerciseSplitAction(
	input: ExerciseSplitInput,
	editingId?: string
): Promise<ActionResult> {
	try {
		const result = editingId ? await editExerciseSplitById(editingId, input) : await createExerciseSplit(input);
		revalidatePath('/splits');
		revalidatePath('/panel');
		return { ok: true, message: result.message };
	} catch (error) {
		return { ok: false, message: actionErrorMessage(error, 'No se pudo guardar el split') };
	}
}

export async function deleteExerciseSplitAction(id: string): Promise<ActionResult> {
	try {
		const result = await deleteExerciseSplitById(id);
		revalidatePath('/splits');
		revalidatePath('/panel');
		return { ok: true, message: result.message };
	} catch (error) {
		return { ok: false, message: actionErrorMessage(error, 'No se pudo eliminar el split') };
	}
}
