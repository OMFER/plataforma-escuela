import type { PreguntaRevisada } from '../../../domain/entities/Examen';
import { formatearFechaHora } from '../../utils/fechas';

type EstadoOpcion = 'acertada' | 'correcta' | 'equivocada' | 'neutra';

/**
 * La opción elegida se pinta según si el alumno acertó (aunque aún no se muestre la respuesta correcta);
 * la correcta, cuando ya se puede ver, también se resalta en verde.
 */
const estadoOpcion = (esCorrecta: boolean, esElegida: boolean, acierto: boolean): EstadoOpcion => {
  if (esElegida) return acierto ? 'acertada' : 'equivocada';
  return esCorrecta ? 'correcta' : 'neutra';
};

/** `color` pinta el ícono, el texto de la opción y sus etiquetas. */
const ESTILOS: Record<EstadoOpcion, { borde: string; icono: string; color: string; texto: string }> = {
  acertada: { borde: 'border-exito bg-exito-container/60', icono: 'check_circle', color: 'text-exito', texto: 'text-exito font-semibold' },
  correcta: { borde: 'border-exito bg-exito-container/60', icono: 'check_circle', color: 'text-exito', texto: 'text-exito font-semibold' },
  equivocada: { borde: 'border-error bg-error-container/40', icono: 'cancel', color: 'text-error', texto: 'text-on-surface' },
  neutra: { borde: 'border-outline-variant', icono: 'radio_button_unchecked', color: 'text-outline', texto: 'text-on-surface' },
};

interface OpcionRevisadaProps {
  texto: string;
  esCorrecta: boolean;
  esElegida: boolean;
  acierto: boolean;
}

const OpcionRevisada = ({ texto, esCorrecta, esElegida, acierto }: OpcionRevisadaProps) => {
  const estado = estadoOpcion(esCorrecta, esElegida, acierto);
  const estilo = ESTILOS[estado];
  return (
    <li
      data-estado={estado}
      data-correcta={esCorrecta || (esElegida && acierto) || undefined}
      className={`flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg border ${estilo.borde}`}
    >
      <span className={`material-symbols-outlined text-[20px] ${estilo.color}`} style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
        {estilo.icono}
      </span>
      <span className={`flex-1 text-body-lg ${estilo.texto}`}>{texto}</span>
      {esElegida && (
        <span className={`text-[12px] font-bold uppercase ${estado === 'acertada' ? 'text-exito' : 'text-on-surface-variant'}`}>Tu respuesta</span>
      )}
      {esCorrecta && <span className="text-[12px] font-bold uppercase text-exito">Respuesta correcta</span>}
    </li>
  );
};

interface RevisionExamenProps {
  preguntas: PreguntaRevisada[];
  /** Cuándo cierra el examen en el grupo: a partir de ahí se ven las respuestas correctas. */
  cierra?: string;
}

/**
 * Revisión pregunta por pregunta: lo que respondió el alumno y si acertó.
 * La respuesta correcta solo aparece cuando el examen ya cerró para todo el grupo.
 */
export const RevisionExamen = ({ preguntas, cierra }: RevisionExamenProps) => {
  const aciertos = preguntas.filter((p) => p.acierto).length;
  const sinRespuestasCorrectas = preguntas.some((p) => p.respuestaCorrecta === undefined);
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
      {sinRespuestasCorrectas && (
        <p role="note" className="flex items-center gap-2 text-body-sm text-on-surface-variant bg-surface-container-low p-3 rounded-lg">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">schedule</span>
          {cierra
            ? `Las respuestas correctas se mostrarán cuando cierre el examen, el ${formatearFechaHora(cierra)}.`
            : 'Las respuestas correctas se mostrarán cuando cierre el examen.'}
        </p>
      )}
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
                    p.acierto ? 'bg-exito-container text-exito' : 'bg-error-container text-error'
                  }`}
                >
                  {p.acierto ? '✓ Correcta' : '✗ Incorrecta'}
                </span>
              </div>
              <ul className="space-y-2">
                {p.opciones.map((texto, j) => (
                  <OpcionRevisada key={`${p.id}-${j}`} texto={texto} esCorrecta={p.respuestaCorrecta !== undefined && j === p.respuestaCorrecta} esElegida={j === p.miRespuesta} acierto={p.acierto} />
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
