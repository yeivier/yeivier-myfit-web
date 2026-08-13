import { PageHeader } from '@/components/app/page-header';
import { SettingsForm } from '@/components/settings/settings-form';
import { getUserSettings } from '@/lib/server/users';
import { getUserExercises } from '@/lib/server/workouts';

export const metadata = { title: 'Configuración — MyFit' };

export default async function SettingsPage() {
	const [settings, exercises] = await Promise.all([getUserSettings(), getUserExercises('minimal')]);
	const exerciseNames = [...new Set(exercises.map((exercise) => exercise.name))].sort((a, b) => a.localeCompare(b));

	return (
		<div className="flex flex-col gap-6">
			<PageHeader title="Configuración" description="Preferencias de la aplicación" />
			<SettingsForm
				initialQuotesEnabled={settings?.motivationalQuotesEnabled ?? false}
				initialDisplayModes={settings?.quotesDisplayModes ?? ['PRE_WORKOUT']}
				exerciseNames={exerciseNames}
			/>
		</div>
	);
}
