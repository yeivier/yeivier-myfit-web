import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateShadesAndTints(count: number): string[] {
	const baseColor = '3079ca';
	const r = parseInt(baseColor.substring(0, 2), 16);
	const g = parseInt(baseColor.substring(2, 4), 16);
	const b = parseInt(baseColor.substring(4, 6), 16);

	const step = Math.floor(255 / (count + 3));
	const colors: string[] = [];

	for (let i = 1; i <= count / 2 + 1; i++) {
		const newR = Math.max(r - i * step, 0);
		const newG = Math.max(g - i * step, 0);
		const newB = Math.max(b - i * step, 0);
		const shade = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
		colors.push(shade);
	}
	for (let i = 1; i <= count / 2; i++) {
		const newR = Math.min(r + i * step, 255);
		const newG = Math.min(g + i * step, 255);
		const newB = Math.min(b + i * step, 255);
		const tint = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
		colors.push(tint);
	}
	return colors;
}

export function getShortDateFromTimestamp(timestamp?: number) {
	const date = new Date(timestamp ?? 0);
	return date.toLocaleDateString('es', { day: '2-digit', month: 'short' });
}

export function arraySum(arr: number[]) {
	return arr.reduce((sum, num) => sum + num, 0);
}

export function arrayAverage(arr: number[]): number {
	return arraySum(arr) / arr.length;
}

export function averagePercentageChange(arr: number[]): number {
	if (arr.length < 2) return 0;

	let totalPercentageChange = 0;
	let numberOfIncrements = 0;

	for (let i = 1; i < arr.length; i++) {
		const previous = arr[i - 1];
		const current = arr[i];
		if (previous === 0 || current === 0) continue;

		const percentageChange = ((current - previous) / previous) * 100;
		totalPercentageChange += isNaN(percentageChange) ? 0 : percentageChange;
		numberOfIncrements++;
	}

	return numberOfIncrements > 0 ? totalPercentageChange / numberOfIncrements : 0;
}

/** Convierte un identificador camelCase (o un enum de Prisma) en texto legible. */
export function convertCamelCaseToNormal(text?: string | null): string {
	if (!text) return '';
	return text
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.toLowerCase()
		.replace(/^\w/, (match) => match.toUpperCase());
}

export function floorToNearestMultiple(number: number, multiple: number) {
	return Math.floor(number / multiple) * multiple;
}

export function groupBy<T, K extends string | number | symbol>(array: T[], keyGetter: (item: T) => K): Record<K, T[]> {
	return array.reduce(
		(result: Record<K, T[]>, currentItem) => {
			const key = keyGetter(currentItem);
			if (!result[key]) {
				result[key] = [];
			}
			result[key].push(currentItem);
			return result;
		},
		{} as Record<K, T[]>
	);
}
