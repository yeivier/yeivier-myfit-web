import Link from 'next/link';
import { auth } from '@/lib/auth';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { UserMenu } from '@/components/app/user-menu';
import { LogoMark } from '@/components/app/logo-mark';

export async function MobileHeader() {
	const session = await auth();

	return (
		<header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur lg:hidden">
			<Link href="/panel" className="flex items-center gap-2 font-bold">
				<LogoMark />
				MyFit
			</Link>
			<div className="ml-auto flex items-center gap-1">
				<ThemeToggle />
				{session?.user && (
					<UserMenu name={session.user.name} email={session.user.email} image={session.user.image} role={session.user.role} />
				)}
			</div>
		</header>
	);
}
