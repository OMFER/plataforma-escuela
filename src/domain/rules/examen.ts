import {
  DIAS_EXTRA_MAX,
  MAX_OPCIONES,
  MIN_OPCIONES,
  type PreguntaNueva,
  type PreguntaRevisada,
  type PreguntaVista,
  type TipoExamen,
} from '../entities/Examen';

export type Respuestas = ReadonlyArray<number | null | undefined>;

/** true si cada pregunta tiene una opción elegida. */
export const estanTodasRespondidas = (respuestas: Respuestas, totalPreguntas: number): boolean =>
  totalPreguntas > 0 &&
  respuestas.length === totalPreguntas &&
  respuestas.every((r) => typeof r === 'number' && Number.isInteger(r) && r >= 0);

export const contarRespondidas = (respuestas: Respuestas): number =>
  respuestas.filter((r) => typeof r === 'number' && r >= 0).length;

const redondear = (n: number): number => Math.round(n * 100) / 100;

export const formatearCalificacion = (calificacion: number, puntajeMaximo: number): string =>
  `${redondear(calificacion)} / ${puntajeMaximo}`;

/** Semanal y Reposición pertenecen a una semana; el Final no. */
export const usaSemana = (tipo: TipoExamen): boolean => tipo !== 'Final';

export interface ConfiguracionExamen {
  tipo: TipoExamen;
  semana?: number;
  diasExtra?: number;
  puntajeMaximo?: number;
}

export const validarDiasExtra = (diasExtra?: number): string[] =>
  diasExtra === undefined || (Number.isInteger(diasExtra) && diasExtra >= 0 && diasExtra <= DIAS_EXTRA_MAX)
    ? []
    : [`Los días extra deben ser un número entero entre 0 y ${DIAS_EXTRA_MAX}.`];

export const validarPuntajeMaximo = (puntajeMaximo?: number): string[] =>
  puntajeMaximo === undefined || puntajeMaximo > 0 ? [] : ['El puntaje máximo debe ser mayor a 0.'];

/** Semana obligatoria salvo en el Final (donde está prohibida), días extra entre 0 y 30 y puntaje positivo. */
export const validarConfiguracionExamen = ({ tipo, semana, diasExtra, puntajeMaximo }: ConfiguracionExamen): string[] => {
  const errores: string[] = [];
  if (usaSemana(tipo)) {
    if (semana === undefined || !Number.isInteger(semana) || semana < 1) errores.push('Elige la semana del examen.');
  } else if (semana !== undefined) {
    errores.push('El examen final no lleva semana.');
  }
  errores.push(...validarDiasExtra(diasExtra), ...validarPuntajeMaximo(puntajeMaximo));
  return errores;
};

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

/** Compara dos listas de preguntas (enunciado, opciones y respuesta correcta). */
export const preguntasIguales = (
  a: ReadonlyArray<Pick<PreguntaNueva, 'enunciado' | 'opciones'> & { respuestaCorrecta?: number }>,
  b: ReadonlyArray<Pick<PreguntaNueva, 'enunciado' | 'opciones'> & { respuestaCorrecta?: number }>,
): boolean =>
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

const esRevisada = (p: PreguntaVista): p is PreguntaRevisada =>
  typeof p.respuestaCorrecta === 'number' && typeof p.miRespuesta === 'number' && typeof p.acierto === 'boolean';

/** Preguntas con revisión completa (lo que ve el alumno tras responder); vacío si no aplica. */
export const revisionDe = (preguntas: PreguntaVista[]): PreguntaRevisada[] =>
  preguntas.length > 0 && preguntas.every(esRevisada) ? (preguntas as PreguntaRevisada[]) : [];
