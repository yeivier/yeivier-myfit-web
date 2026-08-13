<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import * as Table from '$lib/components/ui/table';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import type { MesocycleCyclicSetChange } from '@prisma/client';

	type PropsType = { cyclicSetChanges: MesocycleCyclicSetChange[] };
	let { cyclicSetChanges }: PropsType = $props();
</script>

<ScrollArea class="h-px grow" orientation="both">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Grupo muscular</Table.Head>
				<Table.Head>Volumen máximo</Table.Head>
				<Table.Head>Series añadidas</Table.Head>
				<Table.Head>Sin importar el progreso</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body data-testid="mesocycle-volume-table-body">
			{#each cyclicSetChanges as setChange}
				<Table.Row>
					<Table.Cell class="font-medium">
						{convertCamelCaseToNormal(setChange.customMuscleGroup ?? setChange.muscleGroup)}
					</Table.Cell>
					<Table.Cell>{setChange.maxVolume}</Table.Cell>
					<Table.Cell>{setChange.setIncreaseAmount}</Table.Cell>
					<Table.Cell>
						<Checkbox
							id="{setChange.customMuscleGroup ?? setChange.muscleGroup}-increase-volume-regardless-of-progress"
							checked={setChange.regardlessOfProgress}
							disabled
						/>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell class="font-medium" colspan={4}>
						<div class="text-box">
							No se encontraron cambios cíclicos de series para este mesociclo, es normal en mesociclos migrados
							desde V2
						</div>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</ScrollArea>
