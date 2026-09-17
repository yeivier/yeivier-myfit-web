import Link from 'next/link';
import { Plus, Dumbbell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { loadExerciseSplits } from '@/lib/server/exerciseSplits';

export default async function SplitsPage() {
	const splits = await loadExerciseSplits({});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Splits</h1>
				<Button asChild size="sm" className="gap-1.5">
					<Link href="/splits/nuevo">
						<Plus className="size-4" />
						Nuevo
					</Link>
				</Button>
			</div>

			{splits.length === 0 ? (
				<Card>
					<CardHeader className="items-center py-10 text-center">
						<Dumbbell className="text-muted-foreground mb-2 size-8" />
						<CardTitle>No tenés ningún split todavía</CardTitle>
						<CardDescription>Un split organiza tus días de entrenamiento y sus ejercicios.</CardDescription>
					</CardHeader>
				</Card>
			) : (
				<div className="flex flex-col gap-3">
					{splits.map((split) => (
						<Link key={split.id} href={`/splits/${split.id}`}>
							<Card className="transition-colors hover:bg-accent">
								<CardHeader className="flex-row items-center justify-between py-4">
									<div>
										<CardTitle>{split.name}</CardTitle>
										<CardDescription>
											{split.exerciseSplitDays.length} día{split.exerciseSplitDays.length === 1 ? '' : 's'}
										</CardDescription>
									</div>
									<ChevronRight className="text-muted-foreground size-5 shrink-0" />
								</CardHeader>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
