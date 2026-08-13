import { TrendingUp, ChartColumn, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SignInButton } from '@/components/auth/sign-in-button';

export default async function HomePage() {
	const session = await auth();
	if (session?.user) redirect('/panel');

	return (
		<main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-16 px-6 py-16 sm:py-24">
			<section className="flex flex-col items-center gap-6 text-center">
				<span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
					<Sparkles className="size-3.5" />
					Gratis y de código abierto
				</span>
				<h1 className="max-w-2xl text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
					Entrena mejor, <span className="text-primary">sin pensarlo tanto</span>
				</h1>
				<p className="max-w-lg text-base text-pretty text-muted-foreground sm:text-lg">
					MyFit calcula tu progresión automáticamente: cuánto peso subir, cuántas repeticiones hacer y cuándo
					descansar. Vos solo entrená.
				</p>
				<div className="flex flex-col items-center gap-3 sm:flex-row">
					<SignInButton size="lg" className="gap-2">
						Empezar gratis
						<ArrowRight className="size-4" />
					</SignInButton>
					<Button asChild variant="ghost" size="lg">
						<Link href="#funciones">Ver cómo funciona</Link>
					</Button>
				</div>
			</section>

			<section id="funciones" className="grid w-full gap-4 sm:grid-cols-3">
				<Card>
					<CardHeader>
						<div className="mb-1 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
							<TrendingUp className="size-4.5" />
						</div>
						<CardTitle>Progresión automática</CardTitle>
						<CardDescription>
							Aumenta repeticiones y carga según tu rendimiento anterior, para que siempre progreses.
						</CardDescription>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<div className="mb-1 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
							<ChartColumn className="size-4.5" />
						</div>
						<CardTitle>Estadísticas claras</CardTitle>
						<CardDescription>
							Gráficos simples para armar rutinas equilibradas y comparar tu evolución en el tiempo.
						</CardDescription>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<div className="mb-1 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Sparkles className="size-4.5" />
						</div>
						<CardTitle>A tu manera</CardTitle>
						<CardDescription>
							Editá tu split en medio de un mesociclo, ajustá ejercicios puntuales y mucho más.
						</CardDescription>
					</CardHeader>
				</Card>
			</section>
		</main>
	);
}
