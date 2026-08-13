<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import MenuIcon from 'virtual:icons/lucide/menu';
</script>

<Tabs.Root class="flex w-full grow flex-col" value="basics">
	<Tabs.List class="grid grid-cols-4">
		<Tabs.Trigger value="basics">Básicos</Tabs.Trigger>
		<Tabs.Trigger value="split">Split</Tabs.Trigger>
		<Tabs.Trigger value="volume">Volumen</Tabs.Trigger>
		<Tabs.Trigger value="workouts">Entrenamientos</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="basics">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex justify-between">
					<Skeleton class="h-5 w-32" />
					<MenuIcon />
				</Card.Title>
				<Card.Description>
					<div class="flex justify-between">
						<Skeleton class="text-base-skeleton" />
						<Skeleton class="h-5 w-16 rounded-full" />
					</div>
				</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Progresión de RIR</span>
						<Skeleton class="h-5 w-16 rounded-full" />
					</div>
					<Skeleton class="min-h-10 w-full rounded-lg" />
				</div>
				<div class="flex flex-col">
					<span class="text-sm text-muted-foreground">Split de ejercicios</span>
					<Skeleton class="text-base-skeleton" />
				</div>
				<div class="flex flex-col">
					<span class="text-sm text-muted-foreground">Progresión preferida</span>
					<Skeleton class="text-base-skeleton" />
				</div>
				<div class="flex flex-col">
					<span class="text-sm text-muted-foreground">Porcentaje de sobrecarga preferido</span>
					<Skeleton class="text-base-skeleton" />
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">Última serie al fallo</span>
					<Skeleton class="switch-skeleton" />
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">Forzar coincidencia de RIR</span>
					<Skeleton class="switch-skeleton" />
				</div>
			</Card.Content>
			<Card.Footer class="justify-end">
				<Skeleton class="button-skeleton" />
			</Card.Footer>
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>
