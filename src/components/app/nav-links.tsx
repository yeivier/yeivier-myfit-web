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
		<nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t bg-card/90 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
			<div
				className="grid w-full max-w-[520px] grid-cols-5 px-3 pt-2.5"
				style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
			>
				{navItems.map(({ href, label, Icon }) => {
					const active = pathname.startsWith(href);
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								'flex flex-col items-center gap-1 px-0.5 py-0.5 text-[11px] font-medium text-muted-foreground',
								active && 'text-primary'
							)}
						>
							<Icon className="size-5.5" strokeWidth={active ? 2.25 : 2} />
							{label}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
