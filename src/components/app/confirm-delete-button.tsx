'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ActionResult } from '@/lib/types/actions';

export function ConfirmDeleteButton({
	title,
	description,
	action,
	redirectTo,
	label = 'Eliminar'
}: {
	title: string;
	description: string;
	action: () => Promise<ActionResult>;
	redirectTo?: string;
	label?: string;
}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	return (
		<>
			<Button variant="ghost" size="icon" aria-label={label} onClick={() => setOpen(true)}>
				<Trash2 className="size-4 text-destructive" />
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>{description}</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							disabled={isPending}
							onClick={() =>
								startTransition(async () => {
									const result = await action();
									if (!result.ok) {
										toast.error(result.message);
										return;
									}
									toast.success(result.message);
									setOpen(false);
									if (redirectTo) router.push(redirectTo);
									else router.refresh();
								})
							}
						>
							{isPending ? 'Eliminando…' : label}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
