import { MAX_OPCIONES, MIN_OPCIONES, type PreguntaNueva } from '../entities/Examen';

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

export const fechaLimiteVencida = (fechaLimite: string | undefined, ahora: Date = new Date()): boolean => {
  if (!fechaLimite) return false;
  const limite = new Date(fechaLimite);
  return !Number.isNaN(limite.getTime()) && limite.getTime() < ahora.getTime();
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
