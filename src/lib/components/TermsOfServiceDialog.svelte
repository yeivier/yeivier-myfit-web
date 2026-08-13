<script lang="ts">
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	const TERMS_ACCEPTED_KEY = 'myfit_terms_accepted';
	let open = $state(false);

	onMount(() => {
		if (browser) {
			const termsAccepted = localStorage.getItem(TERMS_ACCEPTED_KEY);
			if (!termsAccepted) {
				// Small delay to ensure everything is loaded
				setTimeout(() => {
					open = true;
				}, 500);
			}
		}
	});

	function acceptTerms() {
		if (browser) {
			localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
			open = false;
		}
	}

	function declineTerms() {
		// User declined - they can't use the app
		if (browser) {
			alert('Debés aceptar los Términos de Servicio para usar MyFit.');
			// Keep the dialog open
		}
	}
</script>

<ResponsiveDialog title="Términos de Servicio" bind:open dismissible={false}>
	{#snippet description()}
		<span class="text-sm">Por favor, leé y aceptá nuestros Términos de Servicio para seguir usando MyFit.</span>
	{/snippet}

	<div class="mt-4 max-h-[50vh] space-y-4 overflow-y-auto rounded-lg border bg-muted/30 p-4 text-sm">
		<div>
			<h3 class="mb-2 font-semibold text-foreground">Aviso Médico</h3>
			<p class="text-muted-foreground">
				La información brindada por MyFit tiene fines meramente informativos y no pretende sustituir el consejo,
				diagnóstico o tratamiento médico profesional.
			</p>
		</div>

		<div>
			<h3 class="mb-2 font-semibold text-foreground">Consultá a tu Médico</h3>
			<p class="text-muted-foreground">
				<strong
					>Antes de empezar cualquier programa de ejercicios, deberías consultar con tu médico u otro profesional de la
					salud calificado.</strong
				> Esto es especialmente importante si tenés alguna condición de salud preexistente, lesión o inquietud.
			</p>
		</div>

		<div>
			<h3 class="mb-2 font-semibold text-foreground">Asunción de Riesgo</h3>
			<p class="text-muted-foreground">
				Reconocés que el ejercicio físico implica riesgos inherentes de lesión. Al usar los algoritmos de progresión y
				las recomendaciones de entrenamiento de MyFit, asumís voluntariamente todos los riesgos asociados con dicho
				ejercicio, incluyendo entre otros distensiones musculares, lesiones articulares, eventos cardiovasculares y
				otras lesiones físicas.
			</p>
		</div>

		<div>
			<h3 class="mb-2 font-semibold text-foreground">Responsabilidad del Usuario</h3>
			<p class="text-muted-foreground">
				Sos el único responsable de usar una forma y técnica de ejercicio adecuadas, ajustar las recomendaciones según
				tus capacidades individuales, escuchar a tu cuerpo, detenerte si sentís dolor o molestias, y buscar atención
				médica profesional cuando sea necesario.
			</p>
		</div>

		<div>
			<h3 class="mb-2 font-semibold text-foreground">Aviso sobre el Algoritmo de Progresión</h3>
			<p class="text-muted-foreground">
				Nuestros algoritmos de progresión se basan en principios generales de fitness y modelos matemáticos. NO están
				personalizados según tu fisiología específica, historial médico o nivel de condición física actual. Debés usar
				tu propio criterio y modificar las recomendaciones según corresponda a tu situación individual.
			</p>
		</div>

		<div class="rounded-lg border-2 border-destructive bg-destructive/10 p-3">
			<p class="font-semibold text-destructive-foreground">
				⚠️ DETENÉ EL EJERCICIO INMEDIATAMENTE y buscá atención médica de emergencia si sentís dolor de pecho,
				dificultad para respirar, mareos, dolor intenso o cualquier otro síntoma preocupante.
			</p>
		</div>

		<div class="rounded-lg border bg-primary/10 p-3">
			<p class="text-xs text-muted-foreground">
				Para ver los Términos de Servicio completos, visitá:
				<a href="/terms-of-service" class="font-semibold text-primary hover:underline" target="_blank">
					myfit.fit/terms-of-service
				</a>
			</p>
		</div>
	</div>

	<div class="mt-6 flex flex-col gap-2">
		<Button onclick={acceptTerms} class="w-full">Acepto los Términos de Servicio</Button>
		<Button onclick={declineTerms} variant="outline" class="w-full">No Acepto</Button>
	</div>
</ResponsiveDialog>
