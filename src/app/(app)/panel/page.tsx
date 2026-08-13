import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { GetStartedCard } from '@/components/app/get-started-card';
import { TodaysWorkoutCard } from '@/components/app/todays-workout-card';
import { GetStartedCardSkeleton, TodaysWorkoutCardSkeleton } from '@/components/app/skeletons';

export const metadata = { title: 'Panel — MyFit' };

export default async function PanelPage() {
	const session = await auth();
	const firstName = session?.user?.name?.split(' ')[0];

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-bold">{firstName ? `Hola, ${firstName} 👋` : 'Panel'}</h1>

			<Suspense fallback={<GetStartedCardSkeleton />}>
				<GetStartedCard />
			</Suspense>

			<div className="flex flex-col gap-2">
				<h2 className="text-sm font-semibold text-muted-foreground">Entrenamiento de hoy</h2>
				<Suspense fallback={<TodaysWorkoutCardSkeleton />}>
					<TodaysWorkoutCard />
				</Suspense>
			</div>
		</div>
	);
}
