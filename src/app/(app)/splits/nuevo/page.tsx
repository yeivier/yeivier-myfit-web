import { PageHeader } from '@/components/app/page-header';
import { NewSplitFlow } from '@/components/splits/new-split-flow';

export const metadata = { title: 'Nuevo split — MyFit' };

export default function NewSplitPage() {
	return (
		<div className="flex flex-col gap-6">
			<PageHeader title="Nuevo split" description="Definí los días de tu rutina y los ejercicios de cada uno" />
			<NewSplitFlow />
		</div>
	);
}
