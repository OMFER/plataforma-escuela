import type { PreguntaRevisada } from '../../../domain/entities/Examen';

const estiloOpcion = (esCorrecta: boolean, esElegida: boolean): string => {
  if (esCorrecta) return 'border-primary bg-secondary-container/40';
  if (esElegida) return 'border-error bg-error-container/40';
  return 'border-outline-variant';
};

const OpcionRevisada = ({ texto, esCorrecta, esElegida }: { texto: string; esCorrecta: boolean; esElegida: boolean }) => (
  <li
    data-correcta={esCorrecta || undefined}
    className={`flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg border ${estiloOpcion(esCorrecta, esElegida)}`}
  >
    <span className={`material-symbols-outlined text-[20px] ${esCorrecta ? 'text-primary' : esElegida ? 'text-error' : 'text-outline'}`} aria-hidden="true">
      {esCorrecta ? 'check_circle' : esElegida ? 'cancel' : 'radio_button_unchecked'}
    </span>
    <span className="flex-1 text-body-lg text-on-surface">{texto}</span>
    {esElegida && <span className="text-[12px] font-bold uppercase text-on-surface-variant">Tu respuesta</span>}
    {esCorrecta && <span className="text-[12px] font-bold uppercase text-primary">Respuesta correcta</span>}
  </li>
);

/** Revisión pregunta por pregunta: lo que respondió el alumno, si acertó y cuál era la respuesta correcta. */
export const RevisionExamen = ({ preguntas }: { preguntas: PreguntaRevisada[] }) => {
  const aciertos = preguntas.filter((p) => p.acierto).length;
  return (
    <section className="space-y-4" aria-labelledby="titulo-revision">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="titulo-revision" className="text-title-md font-headline-lg text-on-surface">
          Revisión de tus respuestas
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          {aciertos} de {preguntas.length} correctas
        </p>
      </div>
      <ol className="space-y-4">
        {preguntas.map((p, i) => (
          <li key={p.id}>
            <article
              aria-label={`Pregunta ${i + 1}`}
              className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-title-md text-on-surface">
                  <span className="text-primary">{i + 1}.</span> {p.enunciado}
                </p>
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-bold ${
                    p.acierto ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-error'
                  }`}
                >
                  {p.acierto ? '✓ Correcta' : '✗ Incorrecta'}
                </span>
              </div>
              <ul className="space-y-2">
                {p.opciones.map((texto, j) => (
                  <OpcionRevisada key={`${p.id}-${j}`} texto={texto} esCorrecta={j === p.respuestaCorrecta} esElegida={j === p.miRespuesta} />
                ))}
              </ul>
              {p.miRespuesta < 0 && <p className="text-body-sm text-on-surface-variant">No respondiste esta pregunta.</p>}
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
};
