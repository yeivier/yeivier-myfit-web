'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { navItems } from '@/components/app/nav-items';
import { cn } from '@/lib/utils';

export function DesktopNavLinks() {
	const pathname = usePathname();

	return (
		<nav className="flex items-center gap-1">
			{navItems.map(({ href, label }) => {
				const active = pathname.startsWith(href);
				return (
					<Link
						key={href}
						href={href}
						className={cn(
							'rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
							active && 'bg-accent text-accent-foreground'
						)}
					>
						{label}
					</Link>
				);
			})}
		</nav>
	);
}

export function MobileBottomNav() {
	const pathname = usePathname();

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background/95 backdrop-blur lg:hidden">
			{navItems.map(({ href, label, Icon }) => {
				const active = pathname.startsWith(href);
				return (
					<Link
						key={href}
						href={href}
						className={cn(
							'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground',
							active && 'text-primary'
						)}
					>
						<Icon className="size-5" />
						{label}
					</Link>
				);
			})}
		</nav>
	);
}
