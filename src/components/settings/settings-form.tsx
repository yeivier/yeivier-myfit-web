'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { renameExercisesAction, updateUserSettingsAction } from '@/lib/actions/settings';
import type { QuotesDisplayMode } from '@prisma/client';

const quotesDisplayModeLabels: Record<QuotesDisplayMode, string> = {
	PRE_WORKOUT: 'Antes de entrenar',
	POST_WORKOUT: 'Al terminar',
	BETWEEN_SETS: 'Entre series'
};

const quotesDisplayModes = Object.keys(quotesDisplayModeLabels) as QuotesDisplayMode[];

function CheckboxField({
	checked,
	onChange,
	label,
	hint
}: {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: string;
	hint?: string;
}) {
	return (
		<label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors hover:bg-accent/50">
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="mt-0.5 size-4 accent-primary"
			/>
			<span className="flex flex-col gap-0.5">
				<span className="text-sm font-medium">{label}</span>
				{hint && <span className="text-xs text-muted-foreground">{hint}</span>}
			</span>
		</label>
	);
}

export function SettingsForm({
	initialQuotesEnabled,
	initialDisplayModes,
	exerciseNames
}: {
	initialQuotesEnabled: boolean;
	initialDisplayModes: QuotesDisplayMode[];
	exerciseNames: string[];
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [quotesEnabled, setQuotesEnabled] = useState(initialQuotesEnabled);
	const [displayModes, setDisplayModes] = useState<QuotesDisplayMode[]>(
		initialDisplayModes.length > 0 ? initialDisplayModes : ['PRE_WORKOUT']
	);
	const [oldName, setOldName] = useState(exerciseNames[0] ?? '');
	const [newName, setNewName] = useState('');

	function toggleDisplayMode(mode: QuotesDisplayMode, checked: boolean) {
		setDisplayModes((current) => {
			const next = checked ? [...current, mode] : current.filter((item) => item !== mode);
			return next.length > 0 ? next : current;
		});
	}

	function saveSettings() {
		startTransition(async () => {
			const result = await updateUserSettingsAction({
				motivationalQuotesEnabled: quotesEnabled,
				quotesDisplayModes: displayModes
			});
			if (!result.ok) {
				toast.error(result.message);
				return;
			}
			toast.success(result.message);
			router.refresh();
		});
	}

	function rename() {
		startTransition(async () => {
			const result = await renameExercisesAction(oldName, newName);
			if (!result.ok) {
				toast.error(result.message);
				return;
			}
			toast.success(result.message);
			setNewName('');
			router.refresh();
		});
	}

	return (
		<div className="flex flex-col gap-6">
			<Card className="flex flex-col gap-4 p-5">
				<div className="flex flex-col gap-1">
					<p className="font-semibold">Frases motivacionales</p>
					<p className="text-sm text-muted-foreground">Mostrá una frase en distintos momentos del entrenamiento.</p>
				</div>

				<CheckboxField
					checked={quotesEnabled}
					onChange={setQuotesEnabled}
					label="Activar frases"
					hint="Si lo desactivás, no se muestra ninguna frase."
				/>

				{quotesEnabled && (
					<div className="flex flex-col gap-2">
						{quotesDisplayModes.map((mode) => (
							<CheckboxField
								key={mode}
								checked={displayModes.includes(mode)}
								onChange={(checked) => toggleDisplayMode(mode, checked)}
								label={quotesDisplayModeLabels[mode]}
							/>
						))}
					</div>
				)}

				<Button onClick={saveSettings} disabled={isPending} className="w-fit gap-1.5">
					{isPending && <Loader2 className="size-4 animate-spin" />}
					Guardar preferencias
				</Button>
			</Card>

			<Card className="flex flex-col gap-4 p-5">
				<div className="flex flex-col gap-1">
					<p className="font-semibold">Renombrar ejercicios</p>
					<p className="text-sm text-muted-foreground">
						Cambia el nombre en todos los entrenamientos registrados, así el historial queda unificado.
					</p>
				</div>

				{exerciseNames.length === 0 ? (
					<p className="text-sm text-muted-foreground">Todavía no registraste ejercicios.</p>
				) : (
					<>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="old-name">Ejercicio</Label>
							<Select id="old-name" value={oldName} onChange={(event) => setOldName(event.target.value)}>
								{exerciseNames.map((name) => (
									<option key={name} value={name}>
										{name}
									</option>
								))}
							</Select>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="new-name">Nombre nuevo</Label>
							<Input
								id="new-name"
								value={newName}
								onChange={(event) => setNewName(event.target.value)}
								placeholder="Por ejemplo Press banca con mancuernas"
							/>
						</div>
						<Button variant="outline" onClick={rename} disabled={isPending} className="w-fit">
							Renombrar
						</Button>
					</>
				)}
			</Card>
		</div>
	);
}
