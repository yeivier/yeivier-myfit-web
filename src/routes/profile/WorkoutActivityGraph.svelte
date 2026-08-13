<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import type { WorkoutStatus } from '@prisma/client';

	interface WorkoutData {
		startedAt: Date;
		workoutOfMesocycle: {
			workoutStatus: WorkoutStatus | null;
		} | null;
	}

	let { workouts = [] }: { workouts: WorkoutData[] } = $props();

	// Generate graph data for the last 365 days
	const today = new Date();
	const oneYearAgo = new Date();
	oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

	// Create a map of dates to workout counts
	const workoutsByDate = new Map<string, { count: number; hasSkipped: boolean; hasRestDay: boolean }>();

	workouts.forEach((workout) => {
		const date = new Date(workout.startedAt);
		const dateKey = date.toISOString().split('T')[0];

		const existing = workoutsByDate.get(dateKey) || { count: 0, hasSkipped: false, hasRestDay: false };

		const status = workout.workoutOfMesocycle?.workoutStatus;
		if (status === 'Skipped') {
			existing.hasSkipped = true;
		} else if (status === 'RestDay') {
			existing.hasRestDay = true;
		} else {
			existing.count += 1;
		}

		workoutsByDate.set(dateKey, existing);
	});

	// Generate grid data (53 weeks × 7 days)
	const weeks: { date: Date; count: number; hasSkipped: boolean; hasRestDay: boolean }[][] = [];
	let currentWeek: { date: Date; count: number; hasSkipped: boolean; hasRestDay: boolean }[] = [];

	// Start from 52 weeks ago
	const startDate = new Date(today);
	startDate.setDate(today.getDate() - 364);

	// Adjust to start on Sunday
	const dayOfWeek = startDate.getDay();
	startDate.setDate(startDate.getDate() - dayOfWeek);

	for (let i = 0; i < 371; i++) {
		const date = new Date(startDate);
		date.setDate(startDate.getDate() + i);

		const dateKey = date.toISOString().split('T')[0];
		const data = workoutsByDate.get(dateKey) || { count: 0, hasSkipped: false, hasRestDay: false };

		currentWeek.push({
			date: new Date(date),
			count: data.count,
			hasSkipped: data.hasSkipped,
			hasRestDay: data.hasRestDay
		});

		if (currentWeek.length === 7) {
			weeks.push(currentWeek);
			currentWeek = [];
		}
	}

	// If there are remaining days, add them
	if (currentWeek.length > 0) {
		weeks.push(currentWeek);
	}

	function getColor(count: number, hasSkipped: boolean, hasRestDay: boolean): string {
		if (hasSkipped) return 'bg-orange-500/70 dark:bg-orange-400/70';
		if (hasRestDay) return 'bg-blue-500/70 dark:bg-blue-400/70';
		if (count === 0) return 'bg-muted/30';
		if (count === 1) return 'bg-green-500/30 dark:bg-green-400/30';
		if (count === 2) return 'bg-green-500/60 dark:bg-green-400/60';
		return 'bg-green-500 dark:bg-green-400';
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function getPopoverText(count: number, hasSkipped: boolean, hasRestDay: boolean, date: Date): string {
		if (hasSkipped) return `Saltado el ${formatDate(date)}`;
		if (hasRestDay) return `Día de descanso el ${formatDate(date)}`;
		if (count === 0) return `Sin entrenamientos el ${formatDate(date)}`;
		return `${count} entrenamiento${count > 1 ? 's' : ''} el ${formatDate(date)}`;
	}

	const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
	const monthLabels: { month: string; weekIndex: number }[] = [];

	let currentMonth = -1;
	weeks.forEach((week, index) => {
		const firstDay = week[0];
		const month = firstDay.date.getMonth();
		if (month !== currentMonth && firstDay.date.getDate() <= 7) {
			monthLabels.push({ month: months[month], weekIndex: index });
			currentMonth = month;
		}
	});
</script>

<div class="space-y-2">
	<div class="py-2 text-sm font-semibold">Gráfico de entrenamientos</div>
	<div class="overflow-x-auto pb-2">
		<div class="inline-block min-w-full">
			<!-- Month labels -->
			<div class="relative mb-1 h-4" style="margin-left: 20px;">
				{#each monthLabels as { month, weekIndex }}
					<span class="absolute text-xs text-muted-foreground" style="left: {weekIndex * 14}px;">
						{month}
					</span>
				{/each}
			</div>

			<!-- Graph grid -->
			<div class="grid gap-[2px]" style="grid-template-columns: auto 1fr;">
				<!-- Day labels column -->
				<div class="grid grid-rows-7 items-center gap-[2px] pr-1 text-[10px] text-muted-foreground">
					<div class="h-3">Dom</div>
					<div class="h-3">Lun</div>
					<div class="h-3">Mar</div>
					<div class="h-3">Mié</div>
					<div class="h-3">Jue</div>
					<div class="h-3">Vie</div>
					<div class="h-3">Sáb</div>
				</div>

				<!-- Weeks grid -->
				<div class="flex gap-[2px]">
					{#each weeks as week}
						<div class="grid grid-rows-7 gap-[2px]">
							{#each week as day}
								<Popover.Root>
									<Popover.Trigger>
										<button
											class="h-3 w-3 rounded-sm transition-all hover:ring-2 hover:ring-offset-1 {getColor(
												day.count,
												day.hasSkipped,
												day.hasRestDay
											)}"
											aria-label={day.date.toLocaleDateString()}
										></button>
									</Popover.Trigger>
									<Popover.Content class="w-auto p-2 text-sm">
										<p>{getPopoverText(day.count, day.hasSkipped, day.hasRestDay, day.date)}</p>
									</Popover.Content>
								</Popover.Root>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
