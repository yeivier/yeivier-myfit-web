import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Topbar } from '@/components/app/topbar';
import { MobileHeader } from '@/components/app/mobile-header';
import { MobileBottomNav } from '@/components/app/nav-links';
import { ViewingAsBanner } from '@/components/app/viewing-as-banner';

export default async function AppLayout({ children }: { children: ReactNode }) {
	const session = await auth();
	if (!session?.user) redirect('/');

	return (
		<div className="flex min-h-screen flex-col">
			<ViewingAsBanner />
			<Topbar />
			<MobileHeader />
			<main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 pt-4 pb-20 lg:px-6 lg:pt-6 lg:pb-6">
				{children}
			</main>
			<MobileBottomNav />
		</div>
	);
}
