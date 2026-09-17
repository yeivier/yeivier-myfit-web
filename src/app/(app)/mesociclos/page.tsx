import Link from 'next/link';
import { Plus, Repeat, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { loadMesocycles } from '@/lib/server/mesocycles';

function statusBadge(startDate: Date | null, endDate: Date | null) {
	if (endDate) return <Badge variant="outline">Completado</Badge>;
	if (startDate)
		return (
			<Badge className="gap-1">
				<Play className="size-3" />
				Activo
			</Badge>
		);
	return <Badge variant="outline">Sin empezar</Badge>;
}

export default async function MesocyclesPage() {
	const mesocycles = await loadMesocycles({});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Mesociclos</h1>
				<Button asChild size="sm" className="gap-1.5">
					<Link href="/mesociclos/nuevo">
						<Plus className="size-4" />
						Nuevo
					</Link>
				</Button>
			</div>

			{mesocycles.length === 0 ? (
				<Card>
					<CardHeader className="items-center py-10 text-center">
						<Repeat className="text-muted-foreground mb-2 size-8" />
						<CardTitle>No tenés ningún mesociclo todavía</CardTitle>
						<CardDescription>Un mesociclo es un bloque de entrenamiento con progresión automática.</CardDescription>
					</CardHeader>
				</Card>
			) : (
				<div className="flex flex-col gap-3">
					{mesocycles.map((m) => (
						<Link key={m.id} href={`/mesociclos/${m.id}`}>
							<Card className="transition-colors hover:bg-accent">
								<CardHeader className="flex-row items-center justify-between py-4">
									<div className="flex items-center gap-2">
										<CardTitle>{m.name}</CardTitle>
										{statusBadge(m.startDate, m.endDate)}
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
