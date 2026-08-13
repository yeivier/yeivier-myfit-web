<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { trpc } from '$lib/trpc/client.js';
	import { TRPCClientError } from '@trpc/client';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { goto } from '$app/navigation';
	import WorkoutActivityGraph from './WorkoutActivityGraph.svelte';

	let { data } = $props();
	let migratingToV2 = $state(false);

	let bodyweight: number | undefined = $state();
	let duration: number | undefined = $state();

	async function migrateToV2(e: SubmitEvent) {
		e.preventDefault();
		if (!bodyweight || !duration) return;
		try {
			migratingToV2 = true;
			toast.warning('No cierres esta ventana ni recargues la página');
			await trpc().users.migrateFromV2.mutate({ bodyweight, duration });
			await goto('/');
			migratingToV2 = false;
			toast.success('Migración completada correctamente');
		} catch (error) {
			if (error instanceof TRPCClientError) {
				toast.error(error.message);
			}
		}
	}

	function formatNumber(num: number) {
		if (num >= 100000) {
			return (num / 1000).toFixed(0) + 'k';
		} else if (num >= 10000) {
			return (num / 1000).toFixed(1) + 'k';
		}
		return num.toString();
	}
</script>

<H2>Perfil</H2>

<div class="mb-4 flex flex-col gap-4">
	<div class="flex flex-col">
		<span class="text-sm text-muted-foreground">Correo electrónico</span>
		<span>{$page.data.session?.user?.email}</span>
	</div>

	<div class="flex flex-col">
		<span class="text-sm text-muted-foreground">Nombre de usuario</span>
		<span>{$page.data.session?.user?.name}</span>
	</div>
</div>

<div class="mb-4 grid grid-cols-3 gap-2">
	<Card.Root class="bg-background">
		<Card.Header class="flex p-4">
			<Card.Title class="text-center text-sm font-medium">Entrenamientos</Card.Title>
		</Card.Header>
		<Card.Content class="p-4 pt-0 text-center text-2xl font-bold">
			{#await data.userCounts.workouts}
				<Skeleton class="h-8 w-full" />
			{:then userCounts}
				{formatNumber(userCounts)}
			{/await}
		</Card.Content>
	</Card.Root>
	<Card.Root class="bg-background">
		<Card.Header class="flex p-4">
			<Card.Title class="text-center text-sm font-medium">Ejercicios</Card.Title>
		</Card.Header>
		<Card.Content class="p-4 pt-0 text-center text-2xl font-bold">
			{#await data.userCounts.exercises}
				<Skeleton class="h-8 w-full" />
			{:then userCounts}
				{formatNumber(userCounts)}
			{/await}
		</Card.Content>
	</Card.Root>
	<Card.Root class="bg-background">
		<Card.Header class="flex p-4">
			<Card.Title class="text-center text-sm font-medium">Series</Card.Title>
		</Card.Header>
		<Card.Content class="p-4 pt-0 text-center text-2xl font-bold">
			{#await data.userCounts.sets}
				<Skeleton class="h-8 w-full" />
			{:then userCounts}
				{formatNumber(userCounts)}
			{/await}
		</Card.Content>
	</Card.Root>
</div>

{#await data.workoutsForGraph}
	<Skeleton class="h-40 w-full" />
{:then workouts}
	<Card.Root class="mb-4 bg-background">
		<Card.Content class="p-4">
			<WorkoutActivityGraph {workouts} />
		</Card.Content>
	</Card.Root>
{/await}

{#await data.V2Counts}
	<Skeleton class="h-40 w-full" />
{:then V2Counts}
	{#if V2Counts !== 'Migration has already been performed'}
		<Card.Root>
			<Card.Header>
				<Card.Title>Migración a V2</Card.Title>
				<Card.Description>Trae todos tus datos de V2 a V3</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<p class="text-sm font-light">
					{#if typeof V2Counts === 'string'}
						{V2Counts}
					{:else}
						Correo electrónico: <span class="font-semibold">{V2Counts.emailId}</span><br />
						Mesociclos: <span class="font-semibold">{V2Counts.mesocyclesCount}</span><br />
						Plantillas de mesociclo: <span class="font-semibold">{V2Counts.mesocycleTemplatesCount}</span><br />
						Entrenamientos: <span class="font-semibold">{V2Counts.workoutsCount}</span>
					{/if}
				</p>

				<Separator />

				<form class="space-y-2" id="backfill-form" onsubmit={migrateToV2}>
					<p class="font-semibold">Ingresa los promedios para completar los nuevos datos de V3</p>
					<div class="flex w-full max-w-sm flex-col gap-1.5">
						<Label for="bodyweight">Peso corporal</Label>
						<Input id="bodyweight" type="number" required placeholder="Escribe aquí" bind:value={bodyweight} />
					</div>
					<div class="flex w-full max-w-sm flex-col gap-1.5">
						<Label for="workout-duration">Duración del entrenamiento</Label>
						<Input
							id="workout-duration"
							type="number"
							required
							placeholder="Escribe aquí (en minutos)"
							bind:value={duration}
						/>
					</div>
				</form>
			</Card.Content>
			<Card.Footer class="justify-between">
				<Button
					class="ml-auto gap-2"
					type="submit"
					form="backfill-form"
					disabled={typeof V2Counts === 'string' || migratingToV2}
				>
					{#if migratingToV2}
						Migrando, espera un momento <LoaderCircle class="animate-spin" />
					{:else}
						Iniciar migración
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
{/await}
