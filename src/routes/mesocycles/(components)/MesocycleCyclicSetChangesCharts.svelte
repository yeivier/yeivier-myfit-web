<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import { type Prisma } from '@prisma/client';
	import type { Selected } from 'bits-ui';
	import {
		ArcElement,
		BarController,
		BarElement,
		CategoryScale,
		Chart,
		Legend,
		LinearScale,
		PieController,
		Tooltip
	} from 'chart.js';
	Chart.register(Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale, PieController, ArcElement);

	type PropsType = {
		cyclicSetChanges: Prisma.MesocycleCyclicSetChangeCreateWithoutMesocycleInput[];
	};

	let { cyclicSetChanges }: PropsType = $props();
	let chartCanvas: HTMLCanvasElement;
	let chart: Chart<'pie', number[], string> | Chart<'bar', number[], string>;

	const muscleGroups = Array.from(
		new Set(
			cyclicSetChanges.map((setChange) =>
				setChange.muscleGroup === 'Custom' ? (setChange.customMuscleGroup as string) : setChange.muscleGroup
			)
		)
	);
	let selectedMuscleGroups: Selected<string>[] = $state(
		muscleGroups
			.slice(0, 3)
			.map((muscleGroup) => ({ value: muscleGroup, label: convertCamelCaseToNormal(muscleGroup) }))
	);

	const chartTypes = ['Maximum volume', 'Set increase amount', 'Regardless of progress'] as const;
	const chartTypeLabels: Record<(typeof chartTypes)[number], string> = {
		'Maximum volume': 'Volumen máximo',
		'Set increase amount': 'Series añadidas',
		'Regardless of progress': 'Sin importar el progreso'
	};
	let selectedChartType: Selected<(typeof chartTypes)[number]> = $state({
		value: 'Maximum volume',
		label: chartTypeLabels['Maximum volume']
	});

	$effect(() => {
		const style = getComputedStyle(document.body);
		const primaryColor = style.getPropertyValue('--primary').split(' ').join(', ');
		const secondaryColor = style.getPropertyValue('--secondary').split(' ').join(', ');

		if (chart) chart.destroy();
		if (selectedChartType.value === 'Maximum volume') {
			const selectedSetChanges = cyclicSetChanges.filter((setChange) =>
				setChange.muscleGroup === 'Custom'
					? selectedMuscleGroups.map((s) => s.value).includes(setChange.customMuscleGroup as string)
					: selectedMuscleGroups.map((s) => s.value).includes(setChange.muscleGroup)
			);
			chart = new Chart(chartCanvas, {
				type: 'bar',
				data: {
					labels: selectedSetChanges.map((setChange) =>
						convertCamelCaseToNormal(setChange.customMuscleGroup ?? setChange.muscleGroup)
					),
					datasets: [
						{
							label: 'Volumen máximo',
							data: selectedSetChanges.map((setChange) => setChange.maxVolume)
						}
					]
				}
			});
		} else if (selectedChartType.value === 'Set increase amount') {
			const possibleSetIncreaseAmounts = [0, 1, 2, 3];
			chart = new Chart(chartCanvas, {
				type: 'bar',
				data: {
					labels: possibleSetIncreaseAmounts.map((n) => n.toString()),
					datasets: [
						{
							label: 'Total de grupos musculares',
							data: possibleSetIncreaseAmounts.map(
								(setIncreaseAmount) =>
									cyclicSetChanges.filter((setChange) => setChange.setIncreaseAmount === setIncreaseAmount).length
							)
						}
					]
				}
			});
		} else if (selectedChartType.value === 'Regardless of progress') {
			const totalRegardlessOfProgress = cyclicSetChanges.filter((s) => s.regardlessOfProgress).length;
			chart = new Chart(chartCanvas, {
				type: 'pie',
				data: {
					labels: ['Sí', 'No'],
					datasets: [
						{
							label: 'Sin importar el progreso',
							data: [totalRegardlessOfProgress, cyclicSetChanges.length - totalRegardlessOfProgress],
							borderWidth: 0,
							backgroundColor: [`hsl(${primaryColor})`, `hsl(${secondaryColor})`]
						}
					]
				}
			});
		}
	});
</script>

<div class="mb-2 w-full grow">
	<canvas
		bind:this={chartCanvas}
		id="chart-canvas"
		class:max-h-56={selectedChartType.value === 'Regardless of progress'}
	></canvas>
</div>

<div class="flex flex-col gap-1">
	<Select.Root bind:selected={selectedChartType}>
		<Select.Label class="p-0">Gráfico</Select.Label>
		<Select.Trigger class="mb-2 w-full">
			<Select.Value placeholder="Selecciona un gráfico" />
		</Select.Trigger>
		<Select.Content class="max-h-48 overflow-y-auto">
			{#each chartTypes as chartType}
				<Select.Item value={chartType}>{chartTypeLabels[chartType]}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	{#if selectedChartType.value === 'Maximum volume'}
		<Select.Root multiple bind:selected={selectedMuscleGroups}>
			<Select.Label class="p-0">Grupos musculares seleccionados</Select.Label>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="Selecciona grupos musculares" />
			</Select.Trigger>
			<Select.Content class="max-h-48 overflow-y-auto">
				{#each muscleGroups as muscleGroup}
					<Select.Item value={muscleGroup}>{convertCamelCaseToNormal(muscleGroup)}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	{/if}
</div>
