'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Square } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { progressMesocycleAction } from '@/lib/actions/mesocycles';

export function MesocycleStageButton({
	id,
	startDate,
	endDate,
	size = 'sm'
}: {
	id: string;
	startDate: string | null;
	endDate: string | null;
	size?: 'sm' | 'default';
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	if (endDate) return null;

	const isStart = !startDate;

	return (
		<Button
			size={size}
			variant={isStart ? 'default' : 'outline'}
			disabled={isPending}
			className="gap-1.5"
			onClick={() =>
				startTransition(async () => {
					const result = await progressMesocycleAction(
						id,
						startDate ? new Date(startDate) : null,
						endDate ? new Date(endDate) : null
					);
					if (!result.ok) {
						toast.error(result.message);
						return;
					}
					toast.success(result.message);
					router.refresh();
				})
			}
		>
			{isStart ? <Play className="size-3.5" /> : <Square className="size-3.5" />}
			{isStart ? 'Iniciar' : 'Detener'}
		</Button>
	);
}
