import Link from 'next/link';
import { LayoutGrid, Pencil, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/app/empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ConfirmDeleteButton } from '@/components/app/confirm-delete-button';
import { deleteExerciseSplitAction } from '@/lib/actions/splits';
import { loadExerciseSplits } from '@/lib/server/exerciseSplits';

export const metadata = { title: 'Splits — MyFit' };

export default async function SplitsPage() {
	const splits = await loadExerciseSplits({});

	return (
		<div className="flex flex-col gap-6">
			<PageHeader title="Splits" description="Las rutinas base sobre las que armás tus mesociclos">
				<Button asChild className="gap-1.5">
					<Link href="/splits/nuevo">
						<Plus className="size-4" />
						Nuevo split
					</Link>
				</Button>
			</PageHeader>

			{splits.length === 0 ? (
				<EmptyState
					Icon={LayoutGrid}
					title="Todavía no tenés splits"
					description="Un split define qué días entrenás y qué ejercicios hacés en cada uno. Es el primer paso para armar un mesociclo."
				>
					<Button asChild className="gap-1.5">
						<Link href="/splits/nuevo">
							<Plus className="size-4" />
							Crear mi primer split
						</Link>
					</Button>
				</EmptyState>
			) : (
				<div className="flex flex-col gap-2">
					{splits.map((split) => {
						const trainingDays = split.exerciseSplitDays.filter((day) => !day.isRestDay);
						return (
							<Card key={split.id} className="flex items-center gap-2 p-4">
								<div className="flex min-w-0 flex-1 flex-col gap-1.5">
									<p className="truncate font-semibold">{split.name}</p>
									<div className="flex flex-wrap items-center gap-1.5">
										<Badge variant="secondary">{split.exerciseSplitDays.length} días</Badge>
										<Badge variant="outline">{trainingDays.length} de entrenamiento</Badge>
									</div>
								</div>
								<Button asChild variant="ghost" size="icon" aria-label={`Editar ${split.name}`}>
									<Link href={`/splits/${split.id}`}>
										<Pencil className="size-4" />
									</Link>
								</Button>
								<ConfirmDeleteButton
									title={`¿Eliminar "${split.name}"?`}
									description="Se elimina el split y sus días. Los mesociclos ya creados a partir de él no se modifican."
									action={deleteExerciseSplitAction.bind(null, split.id)}
								/>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
