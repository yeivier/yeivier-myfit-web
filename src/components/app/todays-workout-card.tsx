import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getRIRForWeek } from '@/lib/utils/workoutUtils';
import { getTodaysWorkoutData } from '@/lib/server/workouts';

export async function TodaysWorkoutCard() {
	const todaysWorkoutData = await getTodaysWorkoutData();
	const wm = todaysWorkoutData.workoutOfMesocycle;

	if (!wm) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>No hay ningún entrenamiento activo</CardTitle>
					<CardDescription>No tenés ningún mesociclo activo en este momento</CardDescription>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					Podés registrar entrenamientos incluso sin un mesociclo, pero te vas a perder la progresión automática y
					las estadísticas del mesociclo.
				</CardContent>
				<CardFooter className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end">
					<Button asChild variant="secondary">
						<Link href="/entrenamientos/nuevo">Entrenar sin mesociclo</Link>
					</Button>
					<Button asChild>
						<Link href="/mesociclos">Ir a mesociclos</Link>
					</Button>
				</CardFooter>
			</Card>
		);
	}

	const isRestDay = wm.workoutStatus === 'RestDay';

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					{isRestDay ? <span className="text-primary">Descanso</span> : wm.splitDayName}
					{!isRestDay && <Badge>{getRIRForWeek(wm.mesocycle.RIRProgression, wm.cycleNumber)} RIR</Badge>}
				</CardTitle>
				<CardDescription>{wm.mesocycle.name}</CardDescription>
			</CardHeader>
			<CardFooter>
				<Button asChild className="ml-auto gap-1.5">
					<Link href="/entrenamientos/nuevo">
						Empezar
						<ChevronRight className="size-4" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
