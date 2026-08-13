import Link from 'next/link';
import { Dumbbell, LayoutGrid, Repeat, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/app/page-header';
import { auth } from '@/lib/auth';
import { getEntityCounts } from '@/lib/server/users';

export const metadata = { title: 'Perfil — MyFit' };

function initials(name?: string | null) {
	if (!name) return '?';
	return name
		.split(' ')
		.slice(0, 2)
		.map((part) => part[0])
		.join('')
		.toUpperCase();
}

export default async function ProfilePage() {
	const [session, counts] = await Promise.all([auth(), getEntityCounts()]);
	const user = session?.user;

	const stats = [
		{ label: 'Entrenamientos', value: counts?.workouts ?? 0, href: '/entrenamientos', Icon: Dumbbell },
		{ label: 'Mesociclos', value: counts?.mesocycles ?? 0, href: '/mesociclos', Icon: Repeat },
		{ label: 'Splits', value: counts?.exerciseSplits ?? 0, href: '/splits', Icon: LayoutGrid }
	];

	return (
		<div className="flex flex-col gap-6">
			<PageHeader title="Perfil" description="Tu cuenta y tu actividad">
				<Button asChild variant="outline" className="gap-1.5">
					<Link href="/ajustes">
						<Settings className="size-4" />
						Configuración
					</Link>
				</Button>
			</PageHeader>

			<Card className="flex items-center gap-4 p-5">
				<Avatar className="size-14">
					{user?.image && <AvatarImage src={user.image} alt={user.name ?? 'Perfil'} referrerPolicy="no-referrer" />}
					<AvatarFallback>{initials(user?.name)}</AvatarFallback>
				</Avatar>
				<div className="flex min-w-0 flex-col">
					<p className="truncate font-semibold">{user?.name ?? 'Sin nombre'}</p>
					<p className="truncate text-sm text-muted-foreground">{user?.email}</p>
				</div>
			</Card>

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
				{stats.map((stat) => (
					<Card key={stat.label} className="p-0">
						<Link href={stat.href} className="flex items-center gap-3 p-4">
							<stat.Icon className="size-5 text-muted-foreground" />
							<div className="flex flex-col">
								<span className="text-lg font-semibold">{stat.value}</span>
								<span className="text-xs text-muted-foreground">{stat.label}</span>
							</div>
						</Link>
					</Card>
				))}
			</div>

			{counts && counts.startedMesocycles > 0 && (
				<p className="text-sm text-muted-foreground">
					Iniciaste {counts.startedMesocycles} {counts.startedMesocycles === 1 ? 'mesociclo' : 'mesociclos'} hasta ahora.
				</p>
			)}
		</div>
	);
}
