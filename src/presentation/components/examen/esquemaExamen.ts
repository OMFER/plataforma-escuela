import { z } from 'zod';
import {
  MAX_OPCIONES,
  MIN_OPCIONES,
  PUNTAJE_MAXIMO_POR_DEFECTO,
  TIPOS_EXAMEN,
  type Examen,
  type PreguntaNueva,
} from '../../../domain/entities/Examen';
import { datetimeLocalAIso, isoADatetimeLocal } from '../../utils/fechas';

export const esquemaPregunta = z
  .object({
    enunciado: z.string().trim().min(1, 'Escribe el enunciado de la pregunta.'),
    opciones: z
      .array(z.object({ texto: z.string().trim().min(1, 'La opción no puede estar vacía.') }))
      .min(MIN_OPCIONES, `Necesitas al menos ${MIN_OPCIONES} opciones.`)
      .max(MAX_OPCIONES, `Máximo ${MAX_OPCIONES} opciones.`),
    respuestaCorrecta: z.number().int().min(0, 'Marca la opción correcta.'),
  })
  .refine((p) => p.respuestaCorrecta < p.opciones.length, {
    path: ['respuestaCorrecta'],
    message: 'Marca la opción correcta.',
  });

export const esquemaExamen = z.object({
  titulo: z.string().trim().min(1, 'El título es obligatorio.'),
  descripcion: z.string(),
  tipo: z.enum(TIPOS_EXAMEN),
  fechaLimite: z.string(),
  puntajeMaximo: z.number({ error: 'Escribe un número.' }).positive('Debe ser mayor a 0.'),
  preguntas: z.array(esquemaPregunta).min(1, 'Añade al menos una pregunta.'),
});

export type FormularioExamenValores = z.infer<typeof esquemaExamen>;
export type PreguntaFormulario = FormularioExamenValores['preguntas'][number];

export const preguntaVacia = (): PreguntaFormulario => ({
  enunciado: '',
  opciones: [{ texto: '' }, { texto: '' }],
  respuestaCorrecta: 0,
});

export const valoresInicialesExamen = (examen: Examen | null, semana?: number): FormularioExamenValores => ({
  titulo: examen?.titulo ?? (semana ? `Examen semana ${semana}` : ''),
  descripcion: examen?.descripcion ?? '',
  tipo: examen?.tipo ?? 'Semanal',
  fechaLimite: isoADatetimeLocal(examen?.fechaLimite),
  puntajeMaximo: examen?.puntajeMaximo ?? PUNTAJE_MAXIMO_POR_DEFECTO,
  preguntas: examen?.preguntas.length
    ? examen.preguntas.map((p) => ({
        enunciado: p.enunciado,
        opciones: p.opciones.map((texto) => ({ texto })),
        respuestaCorrecta: p.respuestaCorrecta ?? 0,
      }))
    : [preguntaVacia()],
});

export const aPreguntasNuevas = (preguntas: PreguntaFormulario[]): PreguntaNueva[] =>
  preguntas.map((p) => ({
    enunciado: p.enunciado,
    opciones: p.opciones.map((o) => o.texto),
    respuestaCorrecta: p.respuestaCorrecta,
  }));

export const aDatosGenerales = (valores: FormularioExamenValores) => ({
  titulo: valores.titulo,
  descripcion: valores.descripcion,
  tipo: valores.tipo,
  fechaLimite: datetimeLocalAIso(valores.fechaLimite),
  puntajeMaximo: valores.puntajeMaximo,
});
