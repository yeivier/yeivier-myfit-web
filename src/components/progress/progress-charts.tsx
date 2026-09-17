'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getUserExercises, getExerciseHistory } from '@/lib/server/workouts';
import { muscleGroupLabels } from '@/lib/constants/labels';

type ExerciseOption = Awaited<ReturnType<typeof getUserExercises>>[number];
type HistoryEntry = Awaited<ReturnType<typeof getExerciseHistory>>[number];

type ChartPoint = {
	date: string;
	sortDate: number;
	estimated1RM: number;
	volume: number;
};

function toChartData(history: HistoryEntry[]): ChartPoint[] {
	return history
		.map((entry) => {
			const activeSets = entry.sets.filter((s) => !s.skipped);
			const estimated1RM = Math.max(0, ...activeSets.map((s) => s.load * (1 + s.reps / 30)));
			const volume = activeSets.reduce((sum, s) => sum + s.reps * s.load, 0);
			const date = new Date(entry.workout.startedAt);
			return {
				date: date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
				sortDate: date.getTime(),
				estimated1RM: Math.round(estimated1RM * 10) / 10,
				volume: Math.round(volume)
			};
		})
		.sort((a, b) => a.sortDate - b.sortDate);
}

export function ProgressCharts() {
	const [exercises, setExercises] = useState<ExerciseOption[] | null>(null);
	const [selected, setSelected] = useState<string>('');
	const [historyFor, setHistoryFor] = useState<{ name: string; data: HistoryEntry[] } | null>(null);

	useEffect(() => {
		getUserExercises('minimal').then((list) => {
			setExercises(list as ExerciseOption[]);
			if (list.length > 0 && 'name' in list[0]) setSelected(list[0].name);
		});
	}, []);

	useEffect(() => {
		if (!selected) return;
		getExerciseHistory({ exerciseName: selected }).then((data) => setHistoryFor({ name: selected, data }));
	}, [selected]);

	const history = historyFor?.name === selected ? historyFor.data : null;

	if (exercises === null) return <p className="text-muted-foreground text-sm">Cargando...</p>;

	if (exercises.length === 0) {
		return (
			<Card>
				<CardHeader className="items-center py-10 text-center">
					<CardTitle>Todavía no tenés entrenamientos registrados</CardTitle>
					<CardDescription>Tu progreso va a aparecer acá una vez que empieces a entrenar.</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const chartData = history ? toChartData(history) : [];

	return (
		<div className="flex flex-col gap-4">
			<Select value={selected} onChange={(e) => setSelected(e.target.value)}>
				{exercises.map((ex) => (
					<option key={ex.name} value={ex.name}>
						{ex.name}
						{'targetMuscleGroup' in ex ? ` · ${muscleGroupLabels[ex.targetMuscleGroup]}` : ''}
					</option>
				))}
			</Select>

			{history === null ? (
				<p className="text-muted-foreground text-sm">Cargando historial...</p>
			) : chartData.length === 0 ? (
				<p className="text-muted-foreground text-sm">Sin datos para este ejercicio todavía.</p>
			) : (
				<>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">1RM estimado</CardTitle>
							<CardDescription>Fórmula de Epley, sobre la mejor serie de cada sesión</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-56 w-full">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={chartData}>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
										<XAxis dataKey="date" fontSize={11} tickLine={false} />
										<YAxis fontSize={11} tickLine={false} width={36} />
										<Tooltip
											contentStyle={{
												background: 'var(--color-card)',
												border: '1px solid var(--color-border)',
												borderRadius: 'var(--radius-tile)',
												fontSize: 12
											}}
										/>
										<Line
											type="monotone"
											dataKey="estimated1RM"
											stroke="var(--color-primary)"
											strokeWidth={2}
											dot={{ r: 3 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Volumen por sesión</CardTitle>
							<CardDescription>Reps × peso, sumado entre series</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-56 w-full">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={chartData}>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
										<XAxis dataKey="date" fontSize={11} tickLine={false} />
										<YAxis fontSize={11} tickLine={false} width={36} />
										<Tooltip
											contentStyle={{
												background: 'var(--color-card)',
												border: '1px solid var(--color-border)',
												borderRadius: 'var(--radius-tile)',
												fontSize: 12
											}}
										/>
										<Line
											type="monotone"
											dataKey="volume"
											stroke="var(--color-chart-2)"
											strokeWidth={2}
											dot={{ r: 3 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
