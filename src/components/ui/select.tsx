import type { ComponentProps } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
	return (
		<div className="relative">
			<select
				data-slot="select"
				className={cn(
					'flex h-10 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent py-2 pr-9 pl-3.5 text-sm shadow-sm transition-colors outline-none',
					'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring',
					'disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
				{...props}
			>
				{children}
			</select>
			<ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
		</div>
	);
}
