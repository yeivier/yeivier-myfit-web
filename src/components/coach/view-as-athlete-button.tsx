'use client';

import { useTransition } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startViewingAthlete } from '@/lib/coach';

export function ViewAsAthleteButton({ athleteId }: { athleteId: string }) {
	const [isPending, startTransition] = useTransition();

	return (
		<Button
			variant="outline"
			size="sm"
			className="gap-1.5"
			disabled={isPending}
			onClick={() => startTransition(() => startViewingAthlete(athleteId))}
		>
			<Eye className="size-4" />
			{isPending ? 'Un momento...' : 'Ver como'}
		</Button>
	);
}
