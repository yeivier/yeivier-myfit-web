import type { QuotesDisplayMode } from '@prisma/client';

export interface WorkoutQuote {
	id: string;
	quote: string;
	author: string;
	category: 'PRE_WORKOUT' | 'POST_WORKOUT' | 'BETWEEN_SETS';
}

export const workoutQuotes: WorkoutQuote[] = [
	{
		id: '1',
		author: 'Anónimo',
		category: 'PRE_WORKOUT',
		quote: 'El único mal entrenamiento es el que no pasó.'
	},
	{
		id: '2',
		author: 'Anónimo',
		category: 'PRE_WORKOUT',
		quote: 'Tu cuerpo aguanta casi cualquier cosa. Es tu mente la que tenés que convencer.'
	},
	{
		id: '3',
		author: 'Anónimo',
		category: 'PRE_WORKOUT',
		quote: 'No lo desees, trabajá por ello.'
	},
	{
		id: '4',
		author: 'Anónimo',
		category: 'PRE_WORKOUT',
		quote: 'Los campeones entrenan, los perdedores se quejan.'
	},
	{
		id: '5',
		author: 'Jerry Rice',
		category: 'PRE_WORKOUT',
		quote: 'Hoy voy a hacer lo que otros no harán, para que mañana pueda lograr lo que otros no pueden.'
	},
	{
		id: '6',
		author: 'Leigh Hunt',
		category: 'PRE_WORKOUT',
		quote: 'La base de toda felicidad es una buena salud.'
	},
	{
		id: '7',
		author: 'Rikki Rogers',
		category: 'PRE_WORKOUT',
		quote:
			'La fuerza no viene de lo que podés hacer. Viene de superar las cosas que alguna vez pensaste que no podías.'
	},
	{
		id: '8',
		author: 'Anónimo',
		category: 'POST_WORKOUT',
		quote: 'Sos más fuerte de lo que pensás. Demostrátelo a vos mismo.'
	},
	{
		id: '9',
		author: 'Anónimo',
		category: 'POST_WORKOUT',
		quote: 'Cada repetición, cada serie, cada gota de sudor valió la pena.'
	},
	{
		id: '10',
		author: 'Anónimo',
		category: 'POST_WORKOUT',
		quote: 'El éxito no se regala. Se gana en el gimnasio.'
	},
	{
		id: '11',
		author: 'Anónimo',
		category: 'POST_WORKOUT',
		quote: 'Acabás de demostrarte que sos capaz de más de lo que imaginabas.'
	},
	{
		id: '12',
		author: 'Anónimo',
		category: 'POST_WORKOUT',
		quote: 'El dolor que sentís hoy será la fuerza que sentirás mañana.'
	},
	{
		id: '13',
		author: 'Anónimo',
		category: 'POST_WORKOUT',
		quote: 'La recuperación no es una señal de debilidad, es una señal de sabiduría.'
	},
	{
		id: '14',
		author: 'Anónimo',
		category: 'POST_WORKOUT',
		quote: 'Conquistaste otro entrenamiento. Mañana conquistarás otra meta.'
	},
	{
		id: '15',
		author: 'Anónimo',
		category: 'BETWEEN_SETS',
		quote: 'Descansá, recuperate, repetí.'
	},
	{
		id: '16',
		author: 'Anónimo',
		category: 'BETWEEN_SETS',
		quote: 'Una serie más, un paso más cerca de tu meta.'
	},
	{
		id: '17',
		author: 'Anónimo',
		category: 'BETWEEN_SETS',
		quote: 'Respirá profundo, mantené el foco.'
	},
	{
		id: '18',
		author: 'Anónimo',
		category: 'BETWEEN_SETS',
		quote: 'Acá es donde se hacen los campeones.'
	},
	{
		id: '19',
		category: 'BETWEEN_SETS',
		author: 'Vincent Williams Sr.',
		quote: 'Esforzate más que ayer si querés un mañana diferente.'
	},
	{
		id: '20',
		author: 'Anónimo',
		category: 'BETWEEN_SETS',
		quote: 'El peso no sabe lo cansado que estás.'
	},
	{
		id: '21',
		author: 'Anónimo',
		category: 'BETWEEN_SETS',
		quote: 'Enfocate en la técnica, no solo en los números.'
	},
	// Dr. Mike Israetel / Renaissance Periodization quotes
	{
		id: '22',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'La sobrecarga progresiva es el principio fundamental del crecimiento. Que cada sesión cuente.'
	},
	{
		id: '23',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'El mejor programa es el que podés ejecutar de forma constante con buena técnica y progresión.'
	},
	{
		id: '24',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'Volumen, intensidad y frecuencia: dominá estas variables y dominarás el crecimiento.'
	},
	{
		id: '25',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'Entrenar no se trata de sufrir, sino de progresar de forma inteligente hacia tus metas.'
	},
	{
		id: '26',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'Tu genética carga el arma, pero tu entrenamiento y tu dieta aprietan el gatillo.'
	},
	{
		id: '27',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Descansá lo suficiente para hacer tu próxima serie con calidad. Apurarte lleva a volumen basura.'
	},
	{
		id: '28',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Cada serie debería acercarte al fallo, pero sin romper la técnica.'
	},
	{
		id: '29',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'El pump es temporal, pero la adaptación es permanente. Enfocate en el proceso.'
	},
	{
		id: '30',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Pequeños progresos aplicados de forma constante generan cambios enormes con el tiempo.'
	},
	{
		id: '31',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Primero la técnica, después la carga. Siempre.'
	},
	{
		id: '32',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Cada repetición es una oportunidad de mejorar. No la desperdicies por levantar con el ego.'
	},
	{
		id: '33',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'La magia ocurre durante la recuperación. Entrená duro, pero recuperate más duro todavía.'
	},
	{
		id: '34',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'Acabás de invertir en tu yo futuro. El interés compuesto empieza ahora.'
	},
	{
		id: '35',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'El músculo crece durante la recuperación, no durante el entrenamiento. Respetá el proceso.'
	},
	{
		id: '36',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'La constancia le gana a la perfección. Otra sesión de calidad en tu haber.'
	},
	{
		id: '37',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'La fatiga esconde tu nivel real. Descansá bien y dejá que salga tu verdadera fuerza.'
	},
	{
		id: '38',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'El trabajo que hiciste hoy se va a acumular en los resultados que verás mañana.'
	},
	// Additional RP-inspired quotes based on training principles
	{
		id: '39',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'La dosis mínima efectiva significa el máximo progreso sostenible.'
	},
	{
		id: '40',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'El entrenamiento basado en ciencia no se trata de complejidad, sino de efectividad.'
	},
	{
		id: '41',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Tu volumen máximo recuperable es tu camino hacia las máximas ganancias.'
	},
	{
		id: '42',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'El esfuerzo sin inteligencia es solo sufrimiento. Entrená con cabeza.'
	},
	{
		id: '43',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'Los deloads no son un paso atrás: son resets estratégicos para lograr más progreso.'
	},
	{
		id: '44',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'Tu próximo entrenamiento empieza con qué tan bien te recuperás de este.'
	}
];

export function getRandomQuote(category: QuotesDisplayMode): WorkoutQuote {
	const categoryQuotes = workoutQuotes.filter((quote) => quote.category === category);
	const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
	return categoryQuotes[randomIndex];
}

export function getRandomQuotes(category: QuotesDisplayMode, count: number = 3): WorkoutQuote[] {
	const categoryQuotes = workoutQuotes.filter((quote) => quote.category === category);
	const shuffled = [...categoryQuotes].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, Math.min(count, categoryQuotes.length));
}
