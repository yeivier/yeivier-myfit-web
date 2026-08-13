<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import Button from '$lib/components/ui/button/button.svelte';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import type { Selected } from 'bits-ui';
	import { cn } from '$lib/utils';

	type PropsType = {
		open: boolean;
		splitDays: { name: string; isRestDay: boolean }[];
		selectedSplitDayIndex: number;
		swapExercises: (swapFromIndex: number) => void;
	};
	let { open = $bindable(false), swapExercises, splitDays, selectedSplitDayIndex }: PropsType = $props();

	let swapExercisesFrom: Selected<number> | undefined = $state();

	function startSwap() {
		if (!swapExercisesFrom?.value) return;
		swapExercises(swapExercisesFrom.value);
		swapExercisesFrom = undefined;
		open = false;
	}
</script>

<ResponsiveDialog title="Intercambiar ejercicios" bind:open>
	{#snippet description()}
		Intercambiar los ejercicios de <span class="font-semibold">
			{splitDays[selectedSplitDayIndex].name}
			<span class="text-muted-foreground">(Día {selectedSplitDayIndex + 1})</span>
		</span> con:
	{/snippet}
	<form class="flex w-full gap-2" onsubmit={startSwap}>
		<Select.Root required bind:selected={swapExercisesFrom}>
			<Select.Trigger class="grow">
				<Select.Value placeholder="Elegí uno" />
			</Select.Trigger>
			<Select.Content>
				{#each splitDays as splitDay, idx}
					{@const isSelectedDay = idx === selectedSplitDayIndex}
					{#if !splitDay.isRestDay}
						<Select.Item class={cn({ 'text-primary': isSelectedDay })} disabled={isSelectedDay} value={idx}>
							{splitDay.name} (Día {idx + 1})
						</Select.Item>
					{:else if splitDay}
						<Select.Item disabled value={idx}>Descanso (Día {idx + 1})</Select.Item>
					{/if}
				{/each}
			</Select.Content>
		</Select.Root>
		<Button class="shrink-0" type="submit">Intercambiar ejercicios</Button>
	</form>
</ResponsiveDialog>
