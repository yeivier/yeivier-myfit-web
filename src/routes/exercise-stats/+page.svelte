<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import ExerciseStats from './ExerciseStats.svelte';

	let { data } = $props();
</script>

<H2>Estadísticas de ejercicios</H2>

<ExerciseStats {data} />
