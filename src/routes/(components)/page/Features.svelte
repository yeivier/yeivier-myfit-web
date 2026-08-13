<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import TrendingUp from 'virtual:icons/lucide/trending-up';
	import ChartColumn from 'virtual:icons/lucide/chart-column';
	import Settings from 'virtual:icons/lucide/settings';
</script>

<div class="col-span-2 grid w-full place-items-center gap-1 lg:grid-cols-3">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center justify-between">
				Progresión
				<TrendingUp />
			</Card.Title>
			<Card.Description class="text-justify lg:text-left">
				Aumenta automáticamente las repeticiones y la carga según tu rendimiento anterior, para asegurarte de que
				siempre estás progresando
			</Card.Description>
		</Card.Header>
	</Card.Root>
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center justify-between">
				Estadísticas
				<ChartColumn />
			</Card.Title>
			<Card.Description class="text-justify lg:text-left">
				¡Todos los gráficos que se te ocurran! Crea rutinas equilibradas y compara tu rendimiento anterior
			</Card.Description>
		</Card.Header>
	</Card.Root>
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center justify-between">
				Personalizable
				<Settings />
			</Card.Title>
			<Card.Description class="text-justify lg:text-left">
				Edita tu split durante los mesociclos, anula la progresión para ejercicios específicos, ¡y mucho más!
			</Card.Description>
		</Card.Header>
	</Card.Root>
</div>
