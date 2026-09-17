import type { ChangeType, MuscleGroup, SetType } from '@prisma/client';

export const muscleGroupLabels: Record<MuscleGroup, string> = {
	Chest: 'Pecho',
	FrontDelts: 'Deltoides frontal',
	SideDelts: 'Deltoides lateral',
	RearDelts: 'Deltoides posterior',
	Lats: 'Dorsales',
	Traps: 'Trapecios',
	Triceps: 'Tríceps',
	Biceps: 'Bíceps',
	Forearms: 'Antebrazos',
	Quads: 'Cuádriceps',
	Hamstrings: 'Isquiotibiales',
	Glutes: 'Glúteos',
	Calves: 'Gemelos',
	Abs: 'Abdominales',
	Neck: 'Cuello',
	Adductors: 'Aductores',
	Abductors: 'Abductores',
	Custom: 'Personalizado'
};

export const setTypeLabels: Record<SetType, string> = {
	Straight: 'Series rectas',
	V2: 'V2',
	Drop: 'Drop set',
	Down: 'Down set',
	Myorep: 'Myorep',
	MyorepMatch: 'Myorep match',
	MyorepMatchDown: 'Myorep match down',
	TopBackoff: 'Top-backoff'
};

export const changeTypeLabels: Record<ChangeType, string> = {
	Percentage: 'Porcentaje',
	AbsoluteLoad: 'Carga absoluta'
};

export const muscleGroups = Object.keys(muscleGroupLabels) as MuscleGroup[];
export const setTypes = Object.keys(setTypeLabels) as SetType[];
