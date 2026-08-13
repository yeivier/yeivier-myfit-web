import type { ComponentType, ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function EmptyState({
	Icon,
	title,
	description,
	children
}: {
	Icon: ComponentType<LucideProps>;
	title: string;
	description: string;
	children?: ReactNode;
}) {
	return (
		<Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
			<div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
				<Icon className="size-5" />
			</div>
			<div className="flex flex-col gap-1">
				<p className="font-semibold">{title}</p>
				<p className="mx-auto max-w-sm text-sm text-balance text-muted-foreground">{description}</p>
			</div>
			{children}
		</Card>
	);
}
