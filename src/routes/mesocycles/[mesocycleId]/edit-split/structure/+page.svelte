<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import * as Table from '$lib/components/ui/table';
	import * as Popover from '$lib/components/ui/popover';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import AddIcon from 'virtual:icons/lucide/plus';
	import RemoveIcon from 'virtual:icons/lucide/minus';
	import LockIcon from 'virtual:icons/lucide/lock';
	import { mesocycleExerciseSplitRunes } from '../mesocycleExerciseSplitRunes.svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';

	let dataLossDays: number[] = $state([]);
	let warningDialogOpen = $state(false);
	let exerciseSplitLocked = $derived(mesocycleExerciseSplitRunes.mesocycle!.workoutsOfMesocycle.length > 0);

	async function submitStructure(warningAcknowledged = false) {
		if (!mesocycleExerciseSplitRunes.validateSplitStructure()) {
			toast.error('Los nombres de los entrenamientos deben ser únicos', {
				description: 'Por ejemplo: Push A, Push B'
			});
			return;
		}
		dataLossDays = mesocycleExerciseSplitRunes.getDataLossDays();
		if (!warningAcknowledged && dataLossDays.length > 0) {
			warningDialogOpen = true;
			return;
		}
		mesocycleExerciseSplitRunes.updateSplitExercisesStructure();
		warningDialogOpen = false;
		await goto('./exercises');
	}
</script>

<H3>Estructura</H3>
<form
	id="exercise-split-structure-form"
	class="contents"
	onsubmit={(e) => {
		e.preventDefault();
		submitStructure();
	}}
>
	<span class="mb-1.5 text-sm font-medium">Estructura del split de ejercicios</span>
	<Table.Root>
		<Table.Header class="border-t">
			<Table.Row>
				<Table.Head>
					<Popover.Root>
						<Popover.Trigger
							disabled={!exerciseSplitLocked}
							class={cn({ hidden: !exerciseSplitLocked })}
							aria-label="mesocycle-exercise-split-edit-lock"
						>
							<LockIcon class="h-4 w-4" />
						</Popover.Trigger>
						<Popover.Content class="w-60 text-sm" align="start">
							No se puede cambiar la duración ni los días de descanso del split del mesociclo después de agregar
							entrenamientos
						</Popover.Content>
					</Popover.Root>
				</Table.Head>
				<Table.Head>Nombre</Table.Head>
				<Table.Head class="text-center">Descanso</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each mesocycleExerciseSplitRunes.splitDays as splitDay, dayNumber}
				<Table.Row>
					<Table.Cell class="text-center">{dayNumber + 1}</Table.Cell>
					<Table.Cell>
						<Input
							id="exercise-split-day-{dayNumber + 1}-name"
							disabled={splitDay.isRestDay}
							placeholder={splitDay.isRestDay ? 'Descanso' : `Día ${dayNumber + 1}`}
							required
							bind:value={splitDay.name}
						/>
					</Table.Cell>
					<Table.Cell class="p-0 text-center">
						<Checkbox
							checked={splitDay.isRestDay}
							disabled={exerciseSplitLocked}
							onCheckedChange={(checked) => {
								if (checked === 'indeterminate') return;
								mesocycleExerciseSplitRunes.toggleSplitDay(dayNumber, checked);
							}}
						/>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</form>

<div class="mb-1 mt-auto grid grid-cols-2 gap-1 pt-1">
	<Button
		class="gap-2"
		disabled={mesocycleExerciseSplitRunes.splitDays.length === 1 || exerciseSplitLocked}
		onclick={mesocycleExerciseSplitRunes.removeSplitDay}
		variant="secondary"
	>
		<RemoveIcon /> Quitar
	</Button>
	<Button
		class="gap-2"
		onclick={mesocycleExerciseSplitRunes.addSplitDay}
		disabled={exerciseSplitLocked}
		variant="secondary"
	>
		<AddIcon /> Agregar
	</Button>
</div>
<Button form="exercise-split-structure-form" type="submit">Siguiente</Button>

<ResponsiveDialog title="Advertencia" bind:open={warningDialogOpen}>
	{#snippet description()}
		Perderás los datos de ejercicios de los siguientes días:
		<span class="font-semibold text-yellow-500">
			{dataLossDays.map((day) => `Día ${day + 1}`).join(', ')}
		</span>. ¿Continuar?
	{/snippet}
	<Button onclick={() => submitStructure(true)} variant="destructive">Continuar</Button>
</ResponsiveDialog>
