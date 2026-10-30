import type { Pregunta, ResumenExamen, Ventana } from '../domain/entities/Examen';
import { usuarioAlumno, usuarioMaestro } from './fakes';

export const sesionAlumno = { token: 't-alumno', usuario: usuarioAlumno };
export const sesionMaestro = { token: 't-maestro', usuario: usuarioMaestro };

/** Ventanas lejos de la fecha real para que los tests no dependan del día en que se ejecutan. */
export const ventanas = {
  abierta: { abre: '2020-01-06T12:00:00.000Z', cierra: '2099-01-10T12:00:00.000Z', estado: 'abierta' },
  proxima: { abre: '2099-03-02T12:00:00.000Z', cierra: '2099-03-09T12:00:00.000Z', estado: 'proxima' },
  cerrada: { abre: '2020-01-06T12:00:00.000Z', cierra: '2020-01-10T12:00:00.000Z', estado: 'cerrada' },
} satisfies Record<string, Ventana>;

export const preguntasEjemplo: Pregunta[] = [
  { id: 'p1', enunciado: '¿Cuánto es 2 + 2?', opciones: ['3', '4'], respuestaCorrecta: 1 },
  { id: 'p2', enunciado: '¿Color del cielo?', opciones: ['Azul', 'Verde', 'Rojo'], respuestaCorrecta: 0 },
];

export const resumenExamen = (cambios: Partial<ResumenExamen> = {}): ResumenExamen => ({
  id: 'e1',
  tipo: 'Semanal',
  semana: 2,
  titulo: 'Quiz semana 2',
  puntajeMaximo: 10,
  totalPreguntas: 2,
  ventana: ventanas.abierta,
  miIntento: null,
  ...cambios,
});
