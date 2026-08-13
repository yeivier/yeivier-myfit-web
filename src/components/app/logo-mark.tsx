import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
	return (
		<span
			className={cn(
				'flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground',
				className
			)}
		>
			M
		</span>
	);
}
