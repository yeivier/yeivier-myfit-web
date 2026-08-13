<svelte:head>
	<title>Documentación - MyFit</title>
	<meta name="description" content="Lee la documentación de MyFit para aprender a usar la app de forma efectiva." />
</svelte:head>

<div class="prose prose-neutral max-w-none dark:prose-invert lg:prose-lg">
	<h1>Documentación</h1>
	<blockquote>Solo un resumen básico de cómo funcionan las cosas en esta app, ya que hay algunas diferencias respecto a la V2</blockquote>

	<h2>Splits de ejercicios</h2>
	<p>
		Un split de ejercicios se refiere a cómo se dividen las sesiones de entrenamiento entre distintos días para
		enfocarse en grupos musculares o patrones de movimiento específicos. Ejemplos: <i>Push Pull Legs</i>,
		<i>Upper Lower</i>, y <i>Full Body.</i>
	</p>
	<p>La app admite tanto splits sincrónicos (semanales) como splits asincrónicos (no semanales).</p>

	<h2>Mesociclo</h2>
	<p>
		Un mesociclo es una unidad de entrenamiento formada por varios microciclos (splits repetidos), que suele durar
		entre 4 y 6 semanas. El mesociclo estructura la progresión y la recuperación, con intensidad o volumen crecientes
		seguidos de fases de descarga para evitar el sobreentrenamiento. ¡La función de descarga llegará pronto!
	</p>

	<h2>Entrenamientos</h2>
	<p>
		Un entrenamiento individual, formado por varios ejercicios, cada uno con sus propias series y opciones. Los
		entrenamientos pueden hacerse con o sin un mesociclo activo.
	</p>
	<p>Usar un mesociclo activo permite que la app progrese el rendimiento y las series en cada microciclo.</p>

	<h2>Split de ejercicios del mesociclo</h2>
	<p>
		Cada vez que creas un mesociclo con un split de ejercicios, ese split en realidad se clona para ese mesociclo.
		Esto te permite, tanto a ti como a la app, hacer cambios en el split del mesociclo sin alterar el split
		original.
	</p>

	<h2>Tipos de series</h2>
	<p>
		Inspirado en esto:
		<a href="https://www.youtube.com/watch?v=XX1GD3sA1_c&list=PLjojr41yPbkCCADYomCimD_-H_e9tyZ6N&index=7">
			video de YouTube de RP.
		</a>
		Puedes usar varios tipos de series en esta app para hacer tus entrenamientos más interesantes y desafiantes.
	</p>

	<h3>Straight sets</h3>
	<p>Series con el mismo peso pero que pueden variar en repeticiones. Fáciles y directas.</p>

	<h3>V2 sets</h3>
	<p>
		También llamadas series predeterminadas, las repeticiones y la carga pueden cambiarse de la forma que quieras.
		<i>Este solía ser el único tipo de serie predeterminado en la V2 de la app.</i>
	</p>

	<h3>Down sets</h3>
	<p>
		Series donde la carga sigue disminuyendo después de la primera serie. Útiles para ejercicios donde la caída de
		repeticiones es alta y genera repeticiones muy bajas al aumentar la carga.
	</p>

	<h3>Drop sets</h3>
	<p>
		Una serie seguida de mini-series donde la carga disminuye después de cada mini-serie. Útiles para acumular mucho
		volumen de entrenamiento en poco tiempo. Convenientes para ejercicios con mancuernas y máquinas de pin.
	</p>

	<h3>Myorep sets</h3>
	<p>
		Similares a las drop sets, una serie seguida de mini-series donde la carga no disminuye después de cada
		mini-serie. Los mismos beneficios que las drop sets, pero también pueden usarse con barras.
	</p>

	<h3>Myorep match sets</h3>
	<p>
		Todas las series posteriores a la primera deben igualar las repeticiones de la primera serie. Las series
		posteriores pueden estar compuestas por varias mini-series con descansos cortos entre ellas para lograr las
		mismas repeticiones.
	</p>

	<h3>Myorep match down sets</h3>
	<p>Similares a las myorep match sets, pero la carga puede disminuir después de la primera serie.</p>

	<h2>Configuración de ejercicios</h2>
	<h3>Fracción de peso corporal</h3>
	<p>
		Los ejercicios pueden implicar peso corporal o no. Por ejemplo, el press de banca no involucra peso corporal de
		forma significativa, por lo que su fracción es 0. Las dominadas involucran todo el peso corporal, por lo que su
		fracción es 1. Las flexiones suelen involucrar aproximadamente 2/3 de tu peso corporal, por lo que su fracción es
		0.67.
	</p>

	<h3>Opciones de series</h3>
	<p>
		Al crear un split de ejercicios, solo indicas el ejercicio y los tipos de series. Durante la implementación del
		mesociclo, puedes distribuir el volumen entre los ejercicios por grupo muscular. Por ejemplo, si estableces 10
		series iniciales para Quads y entrenas Quads 2 veces por microciclo, las series se repartirán de forma
		equitativa (5, 5). La opción de fallo en la última serie se puede establecer globalmente para un mesociclo y
		anularse para ejercicios individuales. Para hacerlo: Mesocycles > [nombre de tu mesociclo] > pestaña Split >
		Edit. Actualmente, para las parciales en posición alargada, puedes agregar una nota a cada ejercicio.
	</p>

	<h2 class="italic">"¡Necesito más ayuda!"</h2>
	<p>
		No dudes en <a href="https://github.com/WhyAsh5114/issues">abrir un issue</a> en el repositorio de GitHub, con
		gusto te ayudaremos y agregaremos más detalles a la documentación
	</p>
</div>
