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
import { signInWithPassword, registerAndSignIn } from '@/lib/auth-actions';

type SignInButtonProps = VariantProps<typeof buttonVariants> & {
	className?: string;
	children: ReactNode;
};

export function SignInButton({ children, ...buttonProps }: SignInButtonProps) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<'signIn' | 'register'>('signIn');
	const [role, setRole] = useState<'COACH' | 'ATHLETE'>('ATHLETE');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		const callbackUrl = pathname === '/' ? undefined : pathname;
		startTransition(async () => {
			const result =
				mode === 'signIn'
					? await signInWithPassword(email, password, callbackUrl)
					: await registerAndSignIn({ email, password, name: name || undefined, role, callbackUrl });
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
					<DialogTitle>{mode === 'signIn' ? 'Entrar a MyFit' : 'Crear cuenta'}</DialogTitle>
					<DialogDescription>
						{mode === 'signIn'
							? 'Ingresá tu email y contraseña para acceder.'
							: 'Elegí si vas a entrenar por tu cuenta o vas a llevar alumnos como coach.'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					{mode === 'register' && (
						<div className="flex flex-col gap-2">
							<Label htmlFor="name">Nombre</Label>
							<Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
						</div>
					)}
					<div className="flex flex-col gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							autoFocus
							autoComplete="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isPending}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="password">Contraseña</Label>
						<Input
							id="password"
							type="password"
							autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={isPending}
						/>
					</div>
					{mode === 'register' && (
						<div className="flex flex-col gap-2">
							<Label>Rol</Label>
							<div className="flex gap-2 rounded-[var(--radius-tile)] border border-input bg-muted p-1">
								<button
									type="button"
									onClick={() => setRole('ATHLETE')}
									className={`flex-1 rounded-[calc(var(--radius-tile)-0.25rem)] py-1.5 text-sm font-medium transition-colors ${role === 'ATHLETE' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}
								>
									Alumno
								</button>
								<button
									type="button"
									onClick={() => setRole('COACH')}
									className={`flex-1 rounded-[calc(var(--radius-tile)-0.25rem)] py-1.5 text-sm font-medium transition-colors ${role === 'COACH' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}
								>
									Coach
								</button>
							</div>
						</div>
					)}
					{error && <p className="text-destructive text-sm">{error}</p>}
					<Button type="submit" disabled={isPending || !email || !password}>
						{isPending ? 'Un momento...' : mode === 'signIn' ? 'Entrar' : 'Crear cuenta'}
					</Button>
					<button
						type="button"
						onClick={() => {
							setMode(mode === 'signIn' ? 'register' : 'signIn');
							setError(null);
						}}
						className="text-muted-foreground text-sm underline-offset-4 hover:underline"
					>
						{mode === 'signIn' ? 'No tenés cuenta? Creá una' : 'Ya tenés cuenta? Entrá'}
					</button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
