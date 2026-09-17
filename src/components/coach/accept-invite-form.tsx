'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { acceptInvite } from '@/lib/coach';

const MIN_PASSWORD_LENGTH = 6;

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (password.length < MIN_PASSWORD_LENGTH) {
			setError(`Elegí una contraseña de al menos ${MIN_PASSWORD_LENGTH} caracteres`);
			return;
		}
		setError(null);
		startTransition(async () => {
			const result = await acceptInvite({ token, password, name: name || undefined });
			if (result?.error) setError(result.error);
		});
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<Label>Email</Label>
				<Input value={email} disabled />
			</div>
			<div className="flex flex-col gap-2">
				<Label htmlFor="name">Nombre</Label>
				<Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
			</div>
			<div className="flex flex-col gap-2">
				<Label htmlFor="password">Elegí una contraseña</Label>
				<Input
					id="password"
					type="password"
					autoComplete="new-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			{error && <p className="text-destructive text-sm">{error}</p>}
			<Button type="submit" disabled={isPending || !password} size="lg">
				{isPending ? 'Creando cuenta...' : 'Crear cuenta y entrar'}
			</Button>
		</form>
	);
}
