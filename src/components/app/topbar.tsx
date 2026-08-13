import Link from 'next/link';
import { auth } from '@/lib/auth';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { UserMenu } from '@/components/app/user-menu';
import { DesktopNavLinks } from '@/components/app/nav-links';
import { LogoMark } from '@/components/app/logo-mark';

export async function Topbar() {
	const session = await auth();

	return (
		<header className="sticky top-0 z-40 hidden h-16 items-center gap-6 border-b bg-background/80 px-6 backdrop-blur lg:flex">
			<Link href="/panel" className="flex items-center gap-2 font-bold">
				<LogoMark />
				MyFit
			</Link>
			<DesktopNavLinks />
			<div className="ml-auto flex items-center gap-2">
				<ThemeToggle />
				{session?.user && (
					<UserMenu name={session.user.name} email={session.user.email} image={session.user.image} />
				)}
			</div>
		</header>
	);
}
