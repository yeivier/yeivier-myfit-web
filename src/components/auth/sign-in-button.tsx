'use client';

import { usePathname } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger
} from '@/components/ui/dialog';
import { signInWithPassword } from '@/lib/auth-actions';

type SignInButtonProps = VariantProps<typeof buttonVariants> & {
	className?: string;
	children: ReactNode;
};

export function SignInButton({ children, ...buttonProps }: SignInButtonProps) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		startTransition(async () => {
			const result = await signInWithPassword(password, pathname === '/' ? undefined : pathname);
			if (result?.error) setError(result.error);
		});
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button {...buttonProps}>{children}</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Entrar a MyFit</DialogTitle>
					<DialogDescription>Ingresá la contraseña para acceder.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label htmlFor="password">Contraseña</Label>
						<Input
							id="password"
							type="password"
							autoFocus
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={isPending}
						/>
						{error && <p className="text-destructive text-sm">{error}</p>}
					</div>
					<Button type="submit" disabled={isPending || !password}>
						{isPending ? 'Entrando...' : 'Entrar'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
