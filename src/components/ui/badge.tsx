import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
	'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap',
	{
		variants: {
			variant: {
				default: 'bg-primary/10 text-primary border-transparent',
				secondary: 'bg-secondary text-secondary-foreground border-transparent',
				destructive: 'bg-destructive/10 text-destructive border-transparent',
				outline: 'text-foreground border-border'
			}
		},
		defaultVariants: { variant: 'default' }
	}
);

export function Badge({
	className,
	variant,
	...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
	return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}
