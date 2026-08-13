'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loadWorkouts } from '@/lib/server/workouts';
import { formatDateTime, formatDuration } from '@/lib/utils/format';

export type WorkoutListItem = Awaited<ReturnType<typeof loadWorkouts>>[number];

const PAGE_SIZE = 10;

function splitDayName(workout: WorkoutListItem) {
	const wm = workout.workoutOfMesocycle;
	if (!wm) return 'Entrenamiento libre';
	return wm.mesocycle.mesocycleExerciseSplitDays[wm.splitDayIndex]?.name ?? 'Entrenamiento';
}

export function WorkoutList({ initialWorkouts }: { initialWorkouts: WorkoutListItem[] }) {
	const [workouts, setWorkouts] = useState(initialWorkouts);
	const [hasMore, setHasMore] = useState(initialWorkouts.length === PAGE_SIZE);
	const [isPending, startTransition] = useTransition();

	function loadMore() {
		startTransition(async () => {
			try {
				const next = await loadWorkouts({ cursorId: workouts[workouts.length - 1]?.id });
				setWorkouts((current) => [...current, ...next]);
				setHasMore(next.length === PAGE_SIZE);
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'No se pudieron cargar más entrenamientos');
			}
		});
	}

	return (
		<div className="flex flex-col gap-2">
			{workouts.map((workout) => {
				const status = workout.workoutOfMesocycle?.workoutStatus;

				return (
					<Card key={workout.id} className="p-0">
						<Link href={`/entrenamientos/${workout.id}`} className="flex items-center gap-3 p-4">
							<div className="flex min-w-0 flex-1 flex-col gap-1.5">
								<p className="truncate font-semibold">{splitDayName(workout)}</p>
								<div className="flex flex-wrap items-center gap-1.5">
									{status === 'RestDay' && <Badge variant="secondary">Descanso</Badge>}
									{status === 'Skipped' && <Badge variant="outline">Salteado</Badge>}
									{workout.workoutOfMesocycle && (
										<Badge variant="outline">{workout.workoutOfMesocycle.mesocycle.name}</Badge>
									)}
									<span className="text-xs text-muted-foreground">{formatDateTime(workout.startedAt)}</span>
									{!status && (
										<span className="text-xs text-muted-foreground">
											· {formatDuration(workout.startedAt, workout.endedAt)}
										</span>
									)}
								</div>
							</div>
							<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
						</Link>
					</Card>
				);
			})}

			{hasMore && (
				<Button variant="outline" disabled={isPending} onClick={loadMore} className="gap-1.5">
					{isPending && <Loader2 className="size-4 animate-spin" />}
					Cargar más
				</Button>
			)}
		</div>
	);
}
