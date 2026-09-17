import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getMyAthletes, getMyInvites } from '@/lib/coach';
import { InviteAthlete } from '@/components/coach/invite-athlete';
import { ViewAsAthleteButton } from '@/components/coach/view-as-athlete-button';

export default async function CoachPage() {
	const session = await auth();
	if (session?.user?.role !== 'COACH') redirect('/panel');

	const [athletes, invites] = await Promise.all([getMyAthletes(), getMyInvites()]);

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-bold">Mis alumnos</h1>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Invitar alumno</CardTitle>
					<CardDescription>Le mandás el link y crea su cuenta ya vinculada a vos.</CardDescription>
				</CardHeader>
				<CardContent>
					<InviteAthlete initialInvites={invites} />
				</CardContent>
			</Card>

			{athletes.length === 0 ? (
				<Card>
					<CardHeader className="items-center py-10 text-center">
						<CardTitle>Todavía no tenés alumnos</CardTitle>
						<CardDescription>Invitá al primero de arriba.</CardDescription>
					</CardHeader>
				</Card>
			) : (
				<div className="flex flex-col gap-3">
					{athletes.map((athlete) => (
						<Card key={athlete.id}>
							<CardHeader className="flex-row items-center justify-between py-4">
								<div>
									<CardTitle>{athlete.name ?? athlete.email}</CardTitle>
									<CardDescription>{athlete.email}</CardDescription>
								</div>
								<ViewAsAthleteButton athleteId={athlete.id} />
							</CardHeader>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
