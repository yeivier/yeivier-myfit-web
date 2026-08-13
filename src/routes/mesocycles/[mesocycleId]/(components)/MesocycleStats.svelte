<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { arraySum, convertCamelCaseToNormal } from '$lib/utils';
	import {
		generatePerformanceChangesPerMuscleGroup,
		generatePerformanceChangesPerSplitDay,
		getSetsPerformedPerMuscleGroup
	} from '$lib/utils/mesocycleUtils';
	import CircleCheck from 'virtual:icons/lucide/circle-check';
	import CircleX from 'virtual:icons/lucide/circle-X';
	import BicepsFlexed from 'virtual:icons/lucide/biceps-flexed';
	import Frown from 'virtual:icons/lucide/frown';
	import CalendarHeart from 'virtual:icons/lucide/calendar-heart';
	import CalendarArrowDown from 'virtual:icons/lucide/calendar-arrow-down';
	import ChartColumnIncreasing from 'virtual:icons/lucide/chart-column-increasing';
	import ChartColumnDecreasing from 'virtual:icons/lucide/chart-column-decreasing';
	import type { RouterOutputs } from '$lib/trpc/router';

	let { mesocycle }: { mesocycle: NonNullable<RouterOutputs['mesocycles']['findById']> } = $props();

	const totalWorkoutsOfMesocycle = $derived(mesocycle.workoutsOfMesocycle.length);
	const totalMesocycleLength = $derived(
		mesocycle.mesocycleExerciseSplitDays.length * arraySum(mesocycle.RIRProgression)
	);
	const totalSkippedWorkouts = $derived(
		mesocycle.workoutsOfMesocycle.filter((wm) => wm.workoutStatus === 'Skipped').length
	);

	const mostSkippedWorkoutDay = $derived.by(() => {
		const frequencyMap: Record<number, number> = {};
		mesocycle.workoutsOfMesocycle
			.filter((wm) => wm.workoutStatus === 'Skipped')
			.forEach((item) => {
				frequencyMap[item.splitDayIndex] = (frequencyMap[item.splitDayIndex] || 0) + 1;
			});
		let mostOccurring: string | undefined;
		let maxCount = 0;
		for (const [key, count] of Object.entries(frequencyMap)) {
			if (count > maxCount) {
				mostOccurring = key;
				maxCount = count;
			}
		}
		if (mostOccurring === undefined) return null;
		return mesocycle.mesocycleExerciseSplitDays[parseInt(mostOccurring)].name;
	});

	const performanceChangesPerMuscleGroups = $derived(
		generatePerformanceChangesPerMuscleGroup(mesocycle.workoutsOfMesocycle)
	);

	const performanceChangesPerSplitDay = $derived(generatePerformanceChangesPerSplitDay(mesocycle));

	const setsPerformedPerMuscleGroup = $derived(getSetsPerformedPerMuscleGroup(mesocycle.workoutsOfMesocycle));
</script>

{#if mesocycle.workoutsOfMesocycle.filter((wm) => wm.workoutStatus === null).length}
	<div class="grid grid-cols-2 gap-1">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Completado</Card.Title>
				<CircleCheck />
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{((totalWorkoutsOfMesocycle / totalMesocycleLength) * 100).toFixed(2)}%
				</div>
				<p class="text-xs text-muted-foreground">
					{totalWorkoutsOfMesocycle}/{totalMesocycleLength} entrenamientos
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Omitidos</Card.Title>
				<CircleX />
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<p>
					<span class="text-2xl font-bold">{totalSkippedWorkouts}</span>
					<span class="text-sm">/ {totalWorkoutsOfMesocycle}</span>
				</p>
				<p class="text-xs text-muted-foreground">
					Más omitido: <span class="font-semibold">{mostSkippedWorkoutDay}</span>
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Mejor músculo</Card.Title>
				<BicepsFlexed />
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{convertCamelCaseToNormal(performanceChangesPerMuscleGroups.at(-1)!.muscleGroup)}
				</div>
				<p class="text-xs text-muted-foreground">
					{performanceChangesPerMuscleGroups.at(-1)!.averagePercentageChange.toFixed(2)}% de aumento cíclico
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Peor músculo</Card.Title>
				<Frown />
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{convertCamelCaseToNormal(performanceChangesPerMuscleGroups[0].muscleGroup)}
				</div>
				<p class="text-xs text-muted-foreground">
					{performanceChangesPerMuscleGroups[0].averagePercentageChange.toFixed(2)}% de aumento cíclico
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Mejor día</Card.Title>
				<CalendarHeart />
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{performanceChangesPerSplitDay.at(-1)!.splitDayName}
				</div>
				<p class="text-xs text-muted-foreground">
					{performanceChangesPerSplitDay.at(-1)!.averagePercentageChange.toFixed(2)}% de aumento cíclico
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Peor día</Card.Title>
				<CalendarArrowDown />
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{performanceChangesPerSplitDay[0].splitDayName}
				</div>
				<p class="text-xs text-muted-foreground">
					{performanceChangesPerSplitDay[0].averagePercentageChange.toFixed(2)}% de aumento cíclico
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Más series</Card.Title>
				<ChartColumnIncreasing />
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{setsPerformedPerMuscleGroup.at(-1)!.muscleGroup}
				</div>
				<p class="text-xs text-muted-foreground">
					Total: {setsPerformedPerMuscleGroup.at(-1)!.totalSets} series
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Menos series</Card.Title>
				<ChartColumnDecreasing />
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{setsPerformedPerMuscleGroup[0].muscleGroup}
				</div>
				<p class="text-xs text-muted-foreground">
					Total: {setsPerformedPerMuscleGroup[0].totalSets} series
				</p>
			</Card.Content>
		</Card.Root>
	</div>
{:else}
	<div class="muted-text-box">No hay entrenamientos para generar estadísticas</div>
{/if}
