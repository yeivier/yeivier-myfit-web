<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { cn } from '$lib/utils';
	export let sheetOpen: boolean | undefined = undefined;

	const linkItems: ({ text: string; href: string } | null)[] = [
		{ text: 'Panel', href: '/dashboard' },
		{ text: 'Estadísticas de ejercicios', href: '/exercise-stats' },
		null,
		{ text: 'Splits de ejercicios', href: '/exercise-splits' },
		{ text: 'Mesociclos', href: '/mesocycles' },
		{ text: 'Entrenamientos', href: '/workouts' },
		null,
		{ text: 'GitHub', href: 'https://github.com/WhyAsh5114/MyFit' },
		{ text: 'Discord', href: 'https://discord.com/invite/2g9YPD6PQu' },
		null,
		{ text: 'Documentación', href: '/docs' },
		{ text: 'Registro de cambios', href: '/changelog' },
		{ text: 'Donaciones', href: '/donations' },
		{ text: 'Política de privacidad', href: '/privacy-policy' },
		{ text: 'Términos de servicio', href: '/terms-of-service' }
	];
</script>

<ul class="mb-auto lg:mt-8">
	{#each linkItems as linkItem}
		{#if linkItem}
			<li>
				<Button
					class={cn('text-muted-foreground lg:text-base', {
						'text-foreground': $page.url.pathname.startsWith(linkItem.href)
					})}
					href={linkItem.href}
					onclick={() => (sheetOpen = false)}
					variant="link"
				>
					{linkItem.text}
				</Button>
			</li>
		{:else}
			<Separator class="my-2.5 bg-foreground opacity-25" />
		{/if}
	{/each}
</ul>
