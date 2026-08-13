import { CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getEntityCounts } from '@/lib/server/users';

export async function GetStartedCard() {
	const entityCounts = await getEntityCounts();

	const tasks = [
		{ label: 'Iniciar sesión', done: true, href: '/panel' },
		{ label: 'Crear un split de ejercicios', done: Number(entityCounts?.exerciseSplits) > 0, href: '/splits' },
		{ label: 'Crear un mesociclo', done: Number(entityCounts?.mesocycles) > 0, href: '/mesociclos' },
		{ label: 'Iniciar un mesociclo', done: Number(entityCounts?.startedMesocycles) > 0, href: '/mesociclos' },
		{ label: 'Registrar un entrenamiento', done: Number(entityCounts?.workouts) > 0, href: '/entrenamientos' }
	];

	const doneCount = tasks.filter((t) => t.done).length;
	if (doneCount === tasks.length) return null;

	return (
		<div className="flex flex-col gap-2">
			<h2 className="text-sm font-semibold text-muted-foreground">Primeros pasos</h2>
			<Card className="divide-y p-1">
				{tasks.map((task, idx) => {
					const prevDone = idx === 0 ? true : tasks[idx - 1].done;
					const content = (
						<div className="flex items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-sm">
							<span className={cn(task.done && 'text-muted-foreground line-through')}>{task.label}</span>
							{task.done ? (
								<CheckCircle2 className="size-4.5 shrink-0 text-primary" />
							) : (
								<Circle className="size-4.5 shrink-0 text-muted-foreground/50" />
							)}
						</div>
					);
					if (task.done || idx === 0 || !prevDone) return <div key={task.label}>{content}</div>;
					return (
						<Link key={task.label} href={task.href} className="block transition-colors hover:bg-accent/60">
							{content}
						</Link>
					);
				})}
			</Card>
		</div>
	);
}
