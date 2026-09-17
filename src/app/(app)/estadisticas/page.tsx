import { ProgressCharts } from '@/components/progress/progress-charts';

export default function StatsPage() {
	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-bold">Progreso</h1>
			<ProgressCharts />
		</div>
	);
}
