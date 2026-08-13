'use server';

import { revalidatePath } from 'next/cache';
import { renameExercises, updateUserSettings, type UpdateUserSettingsInput } from '@/lib/server/users';
import { actionErrorMessage, type ActionResult } from '@/lib/types/actions';

export async function updateUserSettingsAction(input: UpdateUserSettingsInput): Promise<ActionResult> {
	try {
		await updateUserSettings(input);
		revalidatePath('/ajustes');
		return { ok: true, message: 'Preferencias guardadas' };
	} catch (error) {
		return { ok: false, message: actionErrorMessage(error, 'No se pudieron guardar las preferencias') };
	}
}

export async function renameExercisesAction(oldName: string, newName: string): Promise<ActionResult> {
	try {
		if (!oldName || !newName.trim()) return { ok: false, message: 'Elegí un ejercicio y escribí el nombre nuevo' };

		const { count } = await renameExercises(oldName, newName.trim());
		revalidatePath('/entrenamientos');
		revalidatePath('/estadisticas');
		return {
			ok: true,
			message: count === 1 ? 'Se renombró 1 ejercicio' : `Se renombraron ${count} ejercicios`
		};
	} catch (error) {
		return { ok: false, message: actionErrorMessage(error, 'No se pudo renombrar el ejercicio') };
	}
}
