import { z } from 'zod';
import { DIAS_EXTRA_MAX, MAX_OPCIONES, MIN_OPCIONES, type Examen, type PreguntaNueva } from '../../../domain/entities/Examen';
import { EXAMENES_POR_SEMANA, SEMANAS_POR_MATERIA } from '../../../domain/entities/Plan';
import { nombreDeExamen } from '../../../domain/rules/examen';

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
  semana: z.number({ error: 'Elige la semana.' }).int().min(1).max(SEMANAS_POR_MATERIA),
  numero: z.number({ error: 'Elige el examen.' }).int().min(1).max(EXAMENES_POR_SEMANA),
  titulo: z.string().trim().min(1, 'El título es obligatorio.'),
  descripcion: z.string(),
  diasExtra: z
    .number({ error: 'Escribe un número.' })
    .int('Debe ser un número entero.')
    .min(0, 'Mínimo 0 días.')
    .max(DIAS_EXTRA_MAX, `Máximo ${DIAS_EXTRA_MAX} días.`),
  preguntas: z.array(esquemaPregunta).min(1, 'Añade al menos una pregunta.'),
});

export type FormularioExamenValores = z.infer<typeof esquemaExamen>;
export type PreguntaFormulario = FormularioExamenValores['preguntas'][number];

export const preguntaVacia = (): PreguntaFormulario => ({
  enunciado: '',
  opciones: [{ texto: '' }, { texto: '' }],
  respuestaCorrecta: 0,
});

export const valoresInicialesExamen = (
  examen: Examen | null,
  nuevo: { semana: number; numero: number },
): FormularioExamenValores => {
  const semana = examen?.semana ?? nuevo.semana;
  const numero = examen?.numero ?? nuevo.numero;
  return {
    semana,
    numero,
    titulo: examen?.titulo ?? nombreDeExamen(semana, numero),
    descripcion: examen?.descripcion ?? '',
    diasExtra: examen?.diasExtra ?? 0,
    preguntas: examen?.preguntas.length
      ? examen.preguntas.map((p) => ({
          enunciado: p.enunciado,
          opciones: p.opciones.map((texto) => ({ texto })),
          respuestaCorrecta: p.respuestaCorrecta,
        }))
      : [preguntaVacia()],
  };
};

export const aPreguntasNuevas = (preguntas: PreguntaFormulario[]): PreguntaNueva[] =>
  preguntas.map((p) => ({
    enunciado: p.enunciado,
    opciones: p.opciones.map((o) => o.texto),
    respuestaCorrecta: p.respuestaCorrecta,
  }));

/** Campos editables después de crear el examen (la semana y el número ya no cambian). */
export const aDatosGenerales = (valores: FormularioExamenValores) => ({
  titulo: valores.titulo,
  descripcion: valores.descripcion,
  diasExtra: valores.diasExtra,
});

/** Explica al maestro cuándo abre el examen y para qué sirven los días extra. */
export const AYUDA_VENTANA: Record<number, string> = {
  1: 'Abre el lunes de la semana y cierra al terminar el domingo. Los días extra amplían el cierre.',
  2: 'Abre el jueves de la semana y cierra al terminar el domingo. Los días extra amplían el cierre.',
};
