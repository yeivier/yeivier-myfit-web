<script lang="ts">
	import type { HomePageCounts } from '../../+page.server';
	import ActionButtons from './ActionButtons.svelte';
	import CarouselComponent from './CarouselComponent.svelte';
	import Faq from './FAQ.svelte';
	import Features from './Features.svelte';
	import StatsComponent from './StatsComponent.svelte';

	let counts: HomePageCounts = $props();
</script>

<div class="flex flex-col justify-evenly gap-6 px-4">
	<span class="text-center text-3xl font-bold">
		Entrenamiento <span class="text-primary">basado en ciencia</span> y gratis
	</span>
	<span class="text-md text-center leading-tight text-muted-foreground">
		Con progresión automática, estadísticas detalladas y funciones altamente personalizables
	</span>
	<CarouselComponent />
	<StatsComponent {...counts} />
	<ActionButtons {...counts} />
	<Features />
	<Faq />
</div>
