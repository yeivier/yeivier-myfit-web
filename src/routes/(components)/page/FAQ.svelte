<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import CircleHelp from 'virtual:icons/lucide/message-circle-question';
	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;
	export { className as class };
</script>

<div class={cn('flex w-full flex-col', className)}>
	<span class="mx-auto flex items-center gap-4 text-xl font-bold">
		Preguntas frecuentes
		<CircleHelp />
	</span>
	<Accordion.Root class="w-full">
		<Accordion.Item value="item-1">
			<Accordion.Trigger>¿De verdad es gratis?</Accordion.Trigger>
			<Accordion.Content class="text-justify">
				La app es de código abierto y siempre lo será. Está alojada en los planes gratuitos de Vercel y CockroachDB,
				pero si superamos los límites, cualquiera puede ejecutarla localmente.
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-2">
			<Accordion.Trigger>¿Cómo la descargo?</Accordion.Trigger>
			<Accordion.Content class="text-justify">
				La app es una PWA, se puede usar como sitio web o instalar en las plataformas compatibles mediante el ícono
				de descarga del encabezado.
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-3">
			<Accordion.Trigger>¿Y si necesito XYZ?</Accordion.Trigger>
			<Accordion.Content class="text-justify">
				¡Siéntete libre de <a class="text-primary underline" href="https://github.com/WhyAsh5114/MyFit/issues"
					>abrir un issue</a
				>
				en el repositorio de GitHub!
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-4">
			<Accordion.Trigger>¿Funciona sin conexión?</Accordion.Trigger>
			<Accordion.Content class="text-justify">
				Todavía no. Hay planes para que funcione sin conexión y estamos trabajando activamente en ello.
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
