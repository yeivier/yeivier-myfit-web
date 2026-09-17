'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createInvite, cancelInvite } from '@/lib/coach';
import type { getMyInvites } from '@/lib/coach';

type Invite = Awaited<ReturnType<typeof getMyInvites>>[number];

export function InviteAthlete({ initialInvites }: { initialInvites: Invite[] }) {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [invites, setInvites] = useState(initialInvites);
	const [error, setError] = useState<string | null>(null);
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleInvite() {
		if (!email.trim()) return;
		setError(null);
		startTransition(async () => {
			try {
				const invite = await createInvite(email.trim());
				setInvites((prev) => [invite, ...prev]);
				setEmail('');
			} catch (e) {
				setError(e instanceof Error ? e.message : 'No se pudo crear la invitación');
			}
		});
	}

	function inviteUrl(token: string) {
		return typeof window !== 'undefined' ? `${window.location.origin}/invitaciones/${token}` : `/invitaciones/${token}`;
	}

	function copyLink(invite: Invite) {
		navigator.clipboard.writeText(inviteUrl(invite.token));
		setCopiedId(invite.id);
		setTimeout(() => setCopiedId(null), 1500);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex gap-2">
				<Input
					type="email"
					placeholder="email@alumno.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					disabled={isPending}
				/>
				<Button onClick={handleInvite} disabled={isPending || !email.trim()}>
					Invitar
				</Button>
			</div>
			{error && <p className="text-destructive text-sm">{error}</p>}
			{invites.length > 0 && (
				<div className="flex flex-col gap-2">
					{invites.map((invite) => (
						<div
							key={invite.id}
							className="bg-muted flex items-center justify-between gap-2 rounded-[var(--radius-tile)] px-3 py-2 text-sm"
						>
							<span className="truncate">{invite.email}</span>
							<div className="flex shrink-0 gap-1">
								<Button variant="ghost" size="icon" className="size-8" onClick={() => copyLink(invite)}>
									{copiedId === invite.id ? <Check className="size-4" /> : <Copy className="size-4" />}
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="text-destructive size-8"
									onClick={() => {
										startTransition(async () => {
											await cancelInvite(invite.id);
											setInvites((prev) => prev.filter((i) => i.id !== invite.id));
											router.refresh();
										});
									}}
								>
									<X className="size-4" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
