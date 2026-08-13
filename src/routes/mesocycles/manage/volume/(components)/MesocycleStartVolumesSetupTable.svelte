<script lang="ts">
	import { mesocycleRunes } from '../../mesocycleRunes.svelte';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import ChevronDown from 'virtual:icons/lucide/chevron-down';
	import Plus from 'virtual:icons/lucide/plus';
	import { MuscleGroup } from '$lib/utils/prismaEnums';
	import type { Selected } from 'bits-ui';
	import { toast } from 'svelte-sonner';

	type NumericReplaceAllType = {
		setChangeProperty: 'startVolume' | 'maxVolume' | 'setIncreaseAmount';
		open: boolean;
		value: number;
		min: number;
		max: number;
		description: string;
	};

	type BooleanReplaceAllType = {
		setChangeProperty: 'regardlessOfProgress';
		open: boolean;
		value: boolean;
		description: string;
	};

	type ReplaceAllType = NumericReplaceAllType | BooleanReplaceAllType;

	const firstSetChange = mesocycleRunes.mesocycleCyclicSetChanges[0];
	let replaceAllStates: ReplaceAllType[] = $state([
		{
			setChangeProperty: 'startVolume',
			open: false,
			value: firstSetChange.startVolume,
			min: 0,
			max: 100,
			description: 'El volumen inicial de un grupo muscular para el primer microciclo'
		},
		{
			setChangeProperty: 'maxVolume',
			open: false,
			value: firstSetChange.maxVolume,
			min: 0,
			max: 100,
			description: 'El volumen máximo de un grupo muscular a realizar en el mesociclo'
		},
		{
			setChangeProperty: 'setIncreaseAmount',
			open: false,
			value: firstSetChange.setIncreaseAmount,
			min: 0,
			max: 3,
			description: 'Cantidad de series a aumentar cada microciclo para un grupo muscular'
		},
		{
			setChangeProperty: 'regardlessOfProgress',
			open: false,
			value: firstSetChange.regardlessOfProgress,
			description: 'Aplicar aumentos de series aunque el rendimiento no mejore'
		}
	]);

	if (mesocycleRunes.editingMesocycleId !== null) {
		replaceAllStates.shift();
	}

	let muscleGroupPopoverOpen = $state(false);
	let selectedMuscleGroup: Selected<string> = $state({ value: 'Chest', label: 'Chest' });
	let customMuscleGroup = $state('');

	function addMuscleGroup(e: SubmitEvent) {
		e.preventDefault();
		const muscleGroup = selectedMuscleGroup.value === 'Custom' ? customMuscleGroup : selectedMuscleGroup.value;
		const successfulAdd = mesocycleRunes.addMuscleGroupToCyclicSetChanges(muscleGroup, false);

		if (successfulAdd) {
			muscleGroupPopoverOpen = false;
			selectedMuscleGroup = { value: 'Chest', label: 'Chest' };
		} else {
			toast.error('El grupo muscular ya está presente en la tabla');
		}
	}

	function applyChangesToAll(e: Event, state: ReplaceAllType) {
		e.preventDefault();
		mesocycleRunes.mesocycleCyclicSetChanges.forEach((setChange) => {
			if (typeof state.value === 'boolean' && state.setChangeProperty === 'regardlessOfProgress') {
				setChange[state.setChangeProperty] = state.value;
			} else setChange[state.setChangeProperty] = state.value;
		});
		state.open = false;
	}
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>
				<Popover.Root bind:open={muscleGroupPopoverOpen}>
					<Popover.Trigger class="flex items-center text-left" aria-label="add-muscle-group">
						Grupo muscular
						<Plus class="shrink-0 basis-4" />
					</Popover.Trigger>
					<Popover.Content class="flex flex-col gap-2">
						<form class="contents" onsubmit={addMuscleGroup}>
							<div class="flex grow flex-col gap-2">
								<Select.Root
									name="exercise-target-muscle-group"
									onSelectedChange={(v) => {
										if (!v) return;
										selectedMuscleGroup.value = v.value;
									}}
									required
									selected={{
										value: selectedMuscleGroup.value,
										label: convertCamelCaseToNormal(selectedMuscleGroup?.value)
									}}
								>
									<Select.Label class="p-0 text-sm font-medium leading-none">Agregar grupo muscular</Select.Label>
									<Select.Trigger>
										<Select.Value placeholder="Elige uno" />
									</Select.Trigger>
									<Select.Content class="h-48 overflow-y-auto">
										{#each Object.values(MuscleGroup) as muscleGroup}
											<Select.Item label={convertCamelCaseToNormal(muscleGroup)} value={muscleGroup} />
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
							{#if selectedMuscleGroup.value === 'Custom'}
								<div class="flex w-full flex-col gap-1.5">
									<Label for="exercise-custom-muscle-group">Grupo muscular</Label>
									<Input
										id="exercise-custom-muscle-group"
										placeholder="Escribe aquí"
										required
										bind:value={customMuscleGroup}
									/>
								</div>
							{/if}
							<Button type="submit">Agregar</Button>
							<p class="text-sm leading-tight text-muted-foreground">
								Agrega grupos musculares que no estén actualmente en el split si planeas usarlos más adelante
							</p>
						</form>
					</Popover.Content>
				</Popover.Root>
			</Table.Head>
			{#each replaceAllStates as state}
				{@const title = convertCamelCaseToNormal(state.setChangeProperty)}
				<Table.Head>
					<Popover.Root bind:open={state.open}>
						<Popover.Trigger class="flex items-center text-left">
							{title}
							<ChevronDown class="shrink-0 basis-4" />
						</Popover.Trigger>
						<Popover.Content class="flex flex-col gap-2">
							<form class="flex items-end gap-2" onsubmit={(e) => applyChangesToAll(e, state)}>
								{#if typeof state.value === 'boolean'}
									<div class="flex items-center space-x-2 place-self-center">
										<Checkbox id="replace-all-{state.setChangeProperty}" bind:checked={state.value as boolean} />
										<Label class="text-sm font-medium leading-none" for="replace-all-{state.setChangeProperty}">
											{title}
										</Label>
									</div>
								{:else}
									<div class="flex grow flex-col">
										<Label class="mb-1.5" for="replace-all-{state.setChangeProperty}">
											{title}
										</Label>
										<Input
											id="replace-all-{state.setChangeProperty}"
											max={state.max}
											min={state.min}
											placeholder="Escribe aquí"
											required
											type="number"
											bind:value={state.value}
										/>
									</div>
								{/if}
								<Button type="submit">Reemplazar todo</Button>
							</form>
							<span class="text-sm leading-tight text-muted-foreground">
								{state.description}
							</span>
						</Popover.Content>
					</Popover.Root>
				</Table.Head>
			{/each}
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each mesocycleRunes.mesocycleCyclicSetChanges as setChange}
			{@const muscleGroup =
				setChange.muscleGroup === 'Custom' ? (setChange.customMuscleGroup as string) : setChange.muscleGroup}
			<Table.Row>
				<Table.Cell class="font-semibold">
					{convertCamelCaseToNormal(muscleGroup)}
				</Table.Cell>
				{#if mesocycleRunes.editingMesocycleId === null}
					<Table.Cell>
						{#if setChange.inSplit}
							<Input
								id="{muscleGroup}-start-volume"
								aria-label="{muscleGroup}-start-volume"
								required
								type="number"
								bind:value={setChange.startVolume}
							/>
						{/if}
					</Table.Cell>
				{/if}
				<Table.Cell>
					<Input
						id="{muscleGroup}-max-volume"
						aria-label="{muscleGroup}-max-volume"
						required
						type="number"
						bind:value={setChange.maxVolume}
					/>
				</Table.Cell>
				<Table.Cell>
					<Select.Root
						onSelectedChange={(s) => {
							if (!s) return;
							if (s.value === 0) setChange.regardlessOfProgress = false;
							setChange.setIncreaseAmount = s.value;
						}}
						required
						selected={{
							value: setChange.setIncreaseAmount,
							label: setChange.setIncreaseAmount.toString()
						}}
					>
						<Select.Trigger class="w-16" aria-label="{muscleGroup}-set-increase-amount">
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							{#each [0, 1, 2, 3] as option}
								<Select.Item value={option}>{option}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</Table.Cell>
				<Table.Cell class="p-0 text-center">
					<Checkbox
						aria-label="{muscleGroup}-increase-volume-regardless-of-progress"
						disabled={setChange.setIncreaseAmount === 0}
						bind:checked={setChange.regardlessOfProgress as boolean}
					/>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
