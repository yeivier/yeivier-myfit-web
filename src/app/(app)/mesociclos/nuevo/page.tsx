import Link from 'next/link';
import { LayoutGrid, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/app/empty-state';
import { PageHeader } from '@/components/app/page-header';
import { MesocycleForm } from '@/components/mesocycles/mesocycle-form';
import { loadAllExerciseSplitNames } from '@/lib/server/exerciseSplits';

export const metadata = { title: 'Nuevo mesociclo — MyFit' };

export default async function NewMesocyclePage() {
	const splits = await loadAllExerciseSplitNames();

	return (
		<div className="flex flex-col gap-6">
			<PageHeader title="Nuevo mesociclo" description="Un bloque de entrenamiento con progresión automática" />

			{splits.length === 0 ? (
				<EmptyState
					Icon={LayoutGrid}
					title="Primero necesitás un split"
					description="El mesociclo toma los días y ejercicios de un split de ejercicios, así que empezá creando uno."
				>
					<Button asChild className="gap-1.5">
						<Link href="/splits/nuevo">
							<Plus className="size-4" />
							Crear un split
						</Link>
					</Button>
				</EmptyState>
			) : (
				<MesocycleForm splits={splits.map((split) => ({ id: split.id, name: split.name }))} />
			)}
		</div>
	);
}
