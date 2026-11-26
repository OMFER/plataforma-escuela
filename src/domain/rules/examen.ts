import {
  DIAS_EXTRA_MAX,
  ESCALA_CALIFICACION,
  MAX_OPCIONES,
  MIN_OPCIONES,
  type PreguntaNueva,
  type PreguntaRevisada,
  type PreguntaVista,
} from '../entities/Examen';
import { EXAMENES_POR_SEMANA, SEMANAS_POR_MATERIA } from '../entities/Plan';

export type Respuestas = ReadonlyArray<number | null | undefined>;

/** true si cada pregunta tiene una opción elegida. */
export const estanTodasRespondidas = (respuestas: Respuestas, totalPreguntas: number): boolean =>
  totalPreguntas > 0 &&
  respuestas.length === totalPreguntas &&
  respuestas.every((r) => typeof r === 'number' && Number.isInteger(r) && r >= 0);

export const contarRespondidas = (respuestas: Respuestas): number =>
  respuestas.filter((r) => typeof r === 'number' && r >= 0).length;

/** "8.5 / 10". */
export const formatearCalificacion = (calificacion: number): string =>
  `${Math.round(calificacion * 100) / 100} / ${ESCALA_CALIFICACION}`;

/** "Semana 2 · Examen 1". */
export const nombreDeExamen = (semana: number, numero: number): string => `Semana ${semana} · Examen ${numero}`;

/** Las semanas de una materia y los exámenes de cada una: [[1,1],[1,2],[2,1],[2,2]]. */
export const casillasDeExamen = (): { semana: number; numero: number }[] =>
  Array.from({ length: SEMANAS_POR_MATERIA }, (_, s) =>
    Array.from({ length: EXAMENES_POR_SEMANA }, (_, n) => ({ semana: s + 1, numero: n + 1 })),
  ).flat();

export const esSemanaDeMateria = (semana: number): boolean =>
  Number.isInteger(semana) && semana >= 1 && semana <= SEMANAS_POR_MATERIA;

export const esNumeroDeExamen = (numero: number): boolean =>
  Number.isInteger(numero) && numero >= 1 && numero <= EXAMENES_POR_SEMANA;

export const validarDiasExtra = (diasExtra?: number): string[] =>
  diasExtra === undefined || (Number.isInteger(diasExtra) && diasExtra >= 0 && diasExtra <= DIAS_EXTRA_MAX)
    ? []
    : [`Los días extra deben ser un número entero entre 0 y ${DIAS_EXTRA_MAX}.`];

/** Devuelve la lista de problemas de una pregunta (vacía si es válida). */
export const validarPregunta = (pregunta: PreguntaNueva): string[] => {
  const errores: string[] = [];
  if (!pregunta.enunciado.trim()) errores.push('La pregunta necesita un enunciado.');
  if (pregunta.opciones.length < MIN_OPCIONES || pregunta.opciones.length > MAX_OPCIONES) {
    errores.push(`Cada pregunta debe tener entre ${MIN_OPCIONES} y ${MAX_OPCIONES} opciones.`);
  }
  if (pregunta.opciones.some((o) => !o.trim())) errores.push('Ninguna opción puede estar vacía.');
  if (
    !Number.isInteger(pregunta.respuestaCorrecta) ||
    pregunta.respuestaCorrecta < 0 ||
    pregunta.respuestaCorrecta >= pregunta.opciones.length
  ) {
    errores.push('Marca la opción correcta.');
  }
  return errores;
};

type PreguntaComparable = Pick<PreguntaNueva, 'enunciado' | 'opciones'> & { respuestaCorrecta?: number };

/** Compara dos listas de preguntas (enunciado, opciones y respuesta correcta). */
export const preguntasIguales = (a: ReadonlyArray<PreguntaComparable>, b: ReadonlyArray<PreguntaComparable>): boolean =>
  a.length === b.length &&
  a.every((p, i) => {
    const q = b[i];
    return (
      q !== undefined &&
      p.enunciado.trim() === q.enunciado.trim() &&
      p.respuestaCorrecta === q.respuestaCorrecta &&
      p.opciones.length === q.opciones.length &&
      p.opciones.every((o, j) => o.trim() === q.opciones[j]?.trim())
    );
  });

/**
 * Con respuestas registradas solo se corrige la redacción: mismas preguntas, mismo número de
 * opciones y la misma respuesta correcta (la misma regla que aplica el servidor).
 */
export const esCorreccionDeTexto = (
  antes: ReadonlyArray<PreguntaComparable>,
  despues: ReadonlyArray<PreguntaComparable>,
): boolean =>
  antes.length === despues.length &&
  antes.every((p, i) => {
    const q = despues[i];
    return q !== undefined && p.opciones.length === q.opciones.length && p.respuestaCorrecta === q.respuestaCorrecta;
  });

const esRevisada = (p: PreguntaVista): p is PreguntaRevisada =>
  typeof p.miRespuesta === 'number' && typeof p.acierto === 'boolean';

/** Preguntas con revisión (lo que ve el alumno tras responder); vacío si no aplica. */
export const revisionDe = (preguntas: PreguntaVista[]): PreguntaRevisada[] =>
  preguntas.length > 0 && preguntas.every(esRevisada) ? (preguntas as PreguntaRevisada[]) : [];
