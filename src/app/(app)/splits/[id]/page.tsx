import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PencilLine, Repeat, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { findExerciseSplitById } from '@/lib/server/exerciseSplits';
import { muscleGroupLabels } from '@/lib/constants/labels';
import { DeleteSplitButton } from '@/components/splits/delete-split-button';

export default async function SplitDetailPage({ params }: PageProps<'/splits/[id]'>) {
	const { id } = await params;
	const split = await findExerciseSplitById(id);
	if (!split) notFound();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-start justify-between gap-4">
				<h1 className="text-2xl font-bold">{split.name}</h1>
				<div className="flex shrink-0 gap-2">
					<Button asChild variant="outline" size="sm" className="gap-1.5">
						<Link href={`/splits/${split.id}/editar`}>
							<PencilLine className="size-4" />
							Editar
						</Link>
					</Button>
					<DeleteSplitButton id={split.id} />
				</div>
			</div>

			<Button asChild size="lg" className="gap-2">
				<Link href={`/mesociclos/nuevo?splitId=${split.id}`}>
					<Repeat className="size-4" />
					Crear mesociclo desde este split
				</Link>
			</Button>

			<div className="flex flex-col gap-3">
				{split.exerciseSplitDays.map((day) => (
					<Card key={day.id}>
						<CardHeader className="flex-row items-center gap-2 pb-3">
							{day.isRestDay && <Moon className="text-muted-foreground size-4" />}
							<CardTitle>{day.name}</CardTitle>
							{day.isRestDay && <Badge variant="outline">Descanso</Badge>}
						</CardHeader>
						{!day.isRestDay && (
							<CardContent className="flex flex-col gap-2">
								{day.exercises.map((ex) => (
									<div key={ex.id} className="flex items-center justify-between gap-2 text-sm">
										<span className="font-medium">{ex.name}</span>
										<span className="text-muted-foreground">
											{muscleGroupLabels[ex.targetMuscleGroup]} · {ex.repRangeStart}-{ex.repRangeEnd} reps
										</span>
									</div>
								))}
								{day.exercises.length === 0 && <p className="text-muted-foreground text-sm">Sin ejercicios</p>}
							</CardContent>
						)}
					</Card>
				))}
			</div>
		</div>
	);
}
