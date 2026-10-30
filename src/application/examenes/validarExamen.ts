import type { PreguntaNueva } from '../../domain/entities/Examen';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import { validarPregunta } from '../../domain/rules/examen';

export const limpiarPreguntas = (preguntas: PreguntaNueva[]): PreguntaNueva[] =>
  preguntas.map((p) => ({
    enunciado: p.enunciado.trim(),
    opciones: p.opciones.map((o) => o.trim()),
    respuestaCorrecta: p.respuestaCorrecta,
  }));

/** Lanza ErrorAplicacion con todos los problemas encontrados. */
export const asegurarPreguntasValidas = (preguntas: PreguntaNueva[]): void => {
  if (preguntas.length === 0) throw new ErrorAplicacion('El examen necesita al menos una pregunta.', 400);
  const errores = preguntas.flatMap((p, i) => validarPregunta(p).map((e) => `Pregunta ${i + 1}: ${e}`));
  if (errores.length > 0) throw new ErrorAplicacion(errores, 400);
};
