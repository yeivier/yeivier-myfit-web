import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getInviteByToken } from '@/lib/coach';
import { AcceptInviteForm } from '@/components/coach/accept-invite-form';

export default async function InvitePage({ params }: PageProps<'/invitaciones/[token]'>) {
	const { token } = await params;
	const invite = await getInviteByToken(token);
	if (!invite) notFound();

	return (
		<main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
			<Card>
				<CardHeader>
					<CardTitle>Te invitó {invite.coach.name ?? invite.coach.email}</CardTitle>
					<CardDescription>Creá tu cuenta para empezar a entrenar con tu coach en MyFit.</CardDescription>
				</CardHeader>
				<CardContent>
					<AcceptInviteForm token={token} email={invite.email} />
				</CardContent>
			</Card>
		</main>
	);
}
