'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteMesocycleById } from '@/lib/server/mesocycles';

export function DeleteMesocycleButton({ id }: { id: string }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	return (
		<Button
			variant="outline"
			size="sm"
			className="text-destructive gap-1.5"
			disabled={isPending}
			onClick={() => {
				if (!confirm('¿Eliminar este mesociclo? Esta acción no se puede deshacer.')) return;
				startTransition(async () => {
					await deleteMesocycleById(id);
					router.push('/mesociclos');
					router.refresh();
				});
			}}
		>
			<Trash2 className="size-4" />
			{isPending ? 'Eliminando...' : 'Eliminar'}
		</Button>
	);
}
