import { Skeleton } from '@/components/ui/skeleton';

export function TodaysWorkoutCardSkeleton() {
	return (
		<div className="flex flex-col gap-3 rounded-xl border bg-card p-5">
			<Skeleton className="h-5 w-32" />
			<Skeleton className="h-4 w-24" />
			<Skeleton className="ml-auto h-10 w-28 rounded-full" />
		</div>
	);
}

export function GetStartedCardSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			<Skeleton className="h-4 w-24" />
			<Skeleton className="h-44 w-full" />
		</div>
	);
}
