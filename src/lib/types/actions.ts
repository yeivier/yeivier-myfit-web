export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

/** Convierte cualquier error lanzado por la capa de servidor en un mensaje legible. */
export function actionErrorMessage(error: unknown, fallback: string) {
	if (error instanceof Error && error.message) return error.message;
	return fallback;
}
