const dateFormatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFormatter = new Intl.DateTimeFormat('es', {
	day: 'numeric',
	month: 'short',
	hour: '2-digit',
	minute: '2-digit'
});

export function formatDate(value: Date | string) {
	return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: Date | string) {
	return dateTimeFormatter.format(new Date(value));
}

/** Duración legible entre dos instantes, por ejemplo "1 h 12 min". */
export function formatDuration(start: Date | string, end: Date | string) {
	const minutes = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatNumber(value: number, maximumFractionDigits = 1) {
	return new Intl.NumberFormat('es', { maximumFractionDigits }).format(value);
}
