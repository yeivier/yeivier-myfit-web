import Link from 'next/link';
import { ChevronRight, Plus, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/app/empty-state';
import { PageHeader } from '@/components/app/page-header';
import { MesocycleStageButton } from '@/components/mesocycles/mesocycle-stage-button';
import { loadMesocycles } from '@/lib/server/mesocycles';
import { arraySum } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';

export const metadata = { title: 'Mesociclos — MyFit' };

export default async function MesocyclesPage() {
	const mesocycles = await loadMesocycles({});

	return (
		<div className="flex flex-col gap-6">
			<PageHeader title="Mesociclos" description="Bloques de entrenamiento con progresión automática">
				<Button asChild className="gap-1.5">
					<Link href="/mesociclos/nuevo">
						<Plus className="size-4" />
						Nuevo mesociclo
					</Link>
				</Button>
			</PageHeader>

			{mesocycles.length === 0 ? (
				<EmptyState
					Icon={Repeat}
					title="Todavía no tenés mesociclos"
					description="Un mesociclo toma un split y le agrega semanas, series y progresión de carga automática."
				>
					<Button asChild className="gap-1.5">
						<Link href="/mesociclos/nuevo">
							<Plus className="size-4" />
							Crear mi primer mesociclo
						</Link>
					</Button>
				</EmptyState>
			) : (
				<div className="flex flex-col gap-2">
					{mesocycles.map((mesocycle) => {
						const weeks = arraySum(mesocycle.RIRProgression);
						const status = mesocycle.endDate ? 'Completado' : mesocycle.startDate ? 'Activo' : 'Sin iniciar';

						return (
							<Card key={mesocycle.id} className="flex flex-wrap items-center gap-3 p-4">
								<Link href={`/mesociclos/${mesocycle.id}`} className="flex min-w-0 flex-1 items-center gap-2">
									<div className="flex min-w-0 flex-1 flex-col gap-1.5">
										<p className="truncate font-semibold">{mesocycle.name}</p>
										<div className="flex flex-wrap items-center gap-1.5">
											<Badge variant={mesocycle.startDate && !mesocycle.endDate ? 'default' : 'secondary'}>
												{status}
											</Badge>
											<Badge variant="outline">
												{weeks} {weeks === 1 ? 'semana' : 'semanas'}
											</Badge>
											{mesocycle.startDate && (
												<span className="text-xs text-muted-foreground">
													Desde el {formatDate(mesocycle.startDate)}
												</span>
											)}
										</div>
									</div>
									<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
								</Link>
								<MesocycleStageButton
									id={mesocycle.id}
									startDate={mesocycle.startDate ? mesocycle.startDate.toISOString() : null}
									endDate={mesocycle.endDate ? mesocycle.endDate.toISOString() : null}
								/>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
