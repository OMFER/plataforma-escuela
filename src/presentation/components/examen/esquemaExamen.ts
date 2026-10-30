import { z } from 'zod';
import {
  DIAS_EXTRA_MAX,
  MAX_OPCIONES,
  MIN_OPCIONES,
  PUNTAJE_MAXIMO_POR_DEFECTO,
  TIPOS_EXAMEN,
  type Examen,
  type PreguntaNueva,
  type TipoExamen,
} from '../../../domain/entities/Examen';
import { usaSemana } from '../../../domain/rules/examen';

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
  tipo: z.enum(TIPOS_EXAMEN),
  semana: z.number({ error: 'Elige la semana.' }).int().min(1, 'Elige la semana.'),
  titulo: z.string().trim().min(1, 'El título es obligatorio.'),
  descripcion: z.string(),
  diasExtra: z
    .number({ error: 'Escribe un número.' })
    .int('Debe ser un número entero.')
    .min(0, 'Mínimo 0 días.')
    .max(DIAS_EXTRA_MAX, `Máximo ${DIAS_EXTRA_MAX} días.`),
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

const tituloSugerido = (tipo: TipoExamen, semana: number): string => {
  if (tipo === 'Final') return 'Examen final';
  return tipo === 'Reposicion' ? `Reposición semana ${semana}` : `Examen semana ${semana}`;
};

export const valoresInicialesExamen = (
  examen: Examen | null,
  nuevo: { tipo: TipoExamen; semana: number },
): FormularioExamenValores => {
  const tipo = examen?.tipo ?? nuevo.tipo;
  const semana = examen?.semana ?? nuevo.semana;
  return {
    tipo,
    semana,
    titulo: examen?.titulo ?? tituloSugerido(tipo, semana),
    descripcion: examen?.descripcion ?? '',
    diasExtra: examen?.diasExtra ?? 0,
    puntajeMaximo: examen?.puntajeMaximo ?? PUNTAJE_MAXIMO_POR_DEFECTO,
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

/** Campos editables después de crear el examen (tipo y semana ya no cambian). */
export const aDatosGenerales = (valores: FormularioExamenValores) => ({
  titulo: valores.titulo,
  descripcion: valores.descripcion,
  diasExtra: valores.diasExtra,
  puntajeMaximo: valores.puntajeMaximo,
});

export const aTipoYSemana = (valores: FormularioExamenValores) => ({
  tipo: valores.tipo,
  ...(usaSemana(valores.tipo) ? { semana: valores.semana } : {}),
});

/** Explica al maestro cuándo abre el examen y para qué sirven los días extra. */
export const AYUDA_VENTANA: Record<TipoExamen, string> = {
  Semanal: 'Abre al iniciar la semana y cierra al terminar la semana. Los días extra amplían el cierre.',
  Reposicion:
    'Abre cuando cierra el examen semanal y dura 7 días más los días extra. Sirve para aprobar o subir la calificación de la semana.',
  Final: 'Abre al terminar el semestre y dura 7 días más los días extra.',
};
