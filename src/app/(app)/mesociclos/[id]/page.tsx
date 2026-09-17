import { notFound } from 'next/navigation';
import { Moon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { findMesocycleById } from '@/lib/server/mesocycles';
import { muscleGroupLabels } from '@/lib/constants/labels';
import { MesocycleStageButton } from '@/components/mesocycles/mesocycle-stage-button';
import { DeleteMesocycleButton } from '@/components/mesocycles/delete-mesocycle-button';

export default async function MesocycleDetailPage({ params }: PageProps<'/mesociclos/[id]'>) {
	const { id } = await params;
	const mesocycle = await findMesocycleById(id);
	if (!mesocycle) notFound();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">{mesocycle.name}</h1>
					{mesocycle.exerciseSplit && (
						<p className="text-muted-foreground text-sm">Basado en {mesocycle.exerciseSplit.name}</p>
					)}
				</div>
				<div className="flex shrink-0 gap-2">
					<MesocycleStageButton id={mesocycle.id} startDate={mesocycle.startDate} endDate={mesocycle.endDate} />
					<DeleteMesocycleButton id={mesocycle.id} />
				</div>
			</div>

			<div className="grid grid-cols-3 gap-3">
				<Card>
					<CardContent className="p-4">
						<p className="text-muted-foreground text-xs">Overload</p>
						<p className="text-lg font-semibold">{(mesocycle.startOverloadPercentage * 100).toFixed(1)}%</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-muted-foreground text-xs">Semanas</p>
						<p className="text-lg font-semibold">{mesocycle.RIRProgression.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-muted-foreground text-xs">Entrenamientos</p>
						<p className="text-lg font-semibold">{mesocycle.workoutsOfMesocycle.length}</p>
					</CardContent>
				</Card>
			</div>

			<div className="flex flex-col gap-3">
				{mesocycle.mesocycleExerciseSplitDays.map((day) => (
					<Card key={day.id}>
						<CardHeader className="flex-row items-center gap-2 pb-3">
							{day.isRestDay && <Moon className="text-muted-foreground size-4" />}
							<CardTitle>{day.name}</CardTitle>
							{day.isRestDay && <Badge variant="outline">Descanso</Badge>}
						</CardHeader>
						{!day.isRestDay && (
							<CardContent className="flex flex-col gap-2">
								{day.mesocycleSplitDayExercises.map((ex) => (
									<div key={ex.id} className="flex items-center justify-between gap-2 text-sm">
										<span className="font-medium">{ex.name}</span>
										<span className="text-muted-foreground">
											{ex.sets} × {ex.repRangeStart}-{ex.repRangeEnd} · {muscleGroupLabels[ex.targetMuscleGroup]}
										</span>
									</div>
								))}
							</CardContent>
						)}
					</Card>
				))}
			</div>
		</div>
	);
}
