<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { onMount } from 'svelte';
	import DiscordIcon from 'virtual:icons/ic/baseline-discord';
	import ExternalLinkIcon from 'virtual:icons/lucide/external-link';
	import GetStartedComponent from './(components)/GetStartedComponent.svelte';
	import TodaysWorkoutCard from './(components)/TodaysWorkoutCard.svelte';

	let { data } = $props();
	let entityCounts: RouterOutputs['users']['getEntityCounts'] | undefined = $state(undefined);
	let dismissDiscord = $state(false);
	let dismissDomainMove = $state(false);

	onMount(async () => {
		if (data.entityCounts === undefined) {
			entityCounts = null;
			return;
		}
		entityCounts = await data.entityCounts;
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		dismissDiscord = Boolean(window.localStorage.getItem('discord-dismiss'));
		dismissDomainMove = Boolean(window.localStorage.getItem('domain-move-dismiss'));
	});
</script>

<H2>Inicio</H2>
<GetStartedComponent {entityCounts} />

<H3>Entrenamiento de hoy</H3>
<TodaysWorkoutCard {...data} />

{#if !dismissDiscord}
	<Card.Root class="mt-2">
		<Card.Header>
			<Card.Title class="Title">Tenemos un Discord</Card.Title>
			<Card.Description>¡Únete para mantenerte al día, conectar con otros y recibir ayuda!</Card.Description>
		</Card.Header>
		<Card.Footer class="flex justify-between">
			<Button
				variant="outline"
				onclick={() => {
					dismissDiscord = true;
					localStorage.setItem('discord-dismiss', 'true');
				}}
			>
				Descartar
			</Button>
			<Button class="gap-2" href="https://discord.com/invite/2g9YPD6PQu">
				<DiscordIcon />
				Unirme
			</Button>
		</Card.Footer>
	</Card.Root>
{/if}

{#if !dismissDomainMove}
	<Card.Root class="mt-2">
		<Card.Header>
			<Card.Title class="text-primary">🚀 ¡MyFit se mudó a un nuevo dominio!</Card.Title>
			<Card.Description>
				¡Nos mudamos a <strong>myfit.fit</strong> para ofrecerte una mejor experiencia!
				<br /><br />
				<strong>Sigue estos pasos:</strong>
				<br />
				1. Desinstala esta app actual
				<br />
				2. Visita myfit.fit y reinstálala desde ahí
				<br />
				3. Descarta este mensaje cuando termines
			</Card.Description>
		</Card.Header>
		<Card.Footer class="flex justify-between">
			<Button
				variant="outline"
				onclick={() => {
					dismissDomainMove = true;
					localStorage.setItem('domain-move-dismiss', 'true');
				}}
			>
				Descartar
			</Button>
			<Button class="gap-2" href="https://myfit.fit" target="_blank" rel="noopener noreferrer">
				<ExternalLinkIcon />
				Visitar myfit.fit
			</Button>
		</Card.Footer>
	</Card.Root>
{/if}
