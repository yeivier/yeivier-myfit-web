<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import FilterIcon from 'virtual:icons/lucide/filter';
</script>

<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<Button class="grow gap-2" aria-label="buscar" builders={[builder]} variant="secondary">
			Filtros <FilterIcon />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="flex w-11/12 max-w-xl flex-col gap-1">No hay entrenamientos para filtrar</Popover.Content>
</Popover.Root>
