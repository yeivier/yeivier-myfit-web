<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { HomePageCounts } from '../../+page.server';
	import ActionButtons from './ActionButtons.svelte';
	import CarouselComponent from './CarouselComponent.svelte';
	import Faq from './FAQ.svelte';
	import Features from './Features.svelte';
	import StatsComponent from './StatsComponent.svelte';

	let counts: HomePageCounts = $props();
</script>

<ScrollArea>
	<div class="my-12 mr-2.5 grid h-fit grid-cols-2 place-items-center gap-x-2 gap-y-12 overflow-x-hidden">
		<div class="my-auto flex flex-col gap-6">
			<span class="text-3xl font-bold">
				Entrenamiento <span class="text-primary">basado en ciencia</span> y gratis
			</span>
			<span class="text-md leading-tight text-muted-foreground">
				Con progresión automática, estadísticas detalladas y funciones altamente personalizables
			</span>
		</div>
		<CarouselComponent />
		<StatsComponent {...counts} />
		<ActionButtons {...counts} />
		<Features />
		<Faq class="col-span-2" />
	</div>
</ScrollArea>
