'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { progressMesocycleToNextStage } from '@/lib/server/mesocycles';

export function MesocycleStageButton({
	id,
	startDate,
	endDate
}: {
	id: string;
	startDate: Date | null;
	endDate: Date | null;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	if (endDate) return null;

	function handleClick() {
		startTransition(async () => {
			await progressMesocycleToNextStage({ id, startDate, endDate });
			router.refresh();
		});
	}

	return (
		<Button onClick={handleClick} disabled={isPending} size="sm" className="gap-1.5">
			{startDate ? <Square className="size-4" /> : <Play className="size-4" />}
			{isPending ? 'Un momento...' : startDate ? 'Finalizar mesociclo' : 'Iniciar mesociclo'}
		</Button>
	);
}
