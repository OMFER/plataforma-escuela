import type { BoletaMateria } from '../domain/entities/Calificaciones';
import type { Pregunta, ResumenExamen, Ventana } from '../domain/entities/Examen';
import { usuarioAdmin, usuarioAlumno, usuarioMaestro } from './fakes';

export const sesionAlumno = { token: 't-alumno', usuario: usuarioAlumno };
export const sesionMaestro = { token: 't-maestro', usuario: usuarioMaestro };
export const sesionAdmin = { token: 't-admin', usuario: usuarioAdmin };

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

/** Examen 1 de la semana 2 de Matemáticas (semana 2 del grupo). */
export const resumenExamen = (cambios: Partial<ResumenExamen> = {}): ResumenExamen => ({
  id: 'e1',
  materia: { id: 'm1', nombre: 'Matemáticas' },
  semana: 2,
  numero: 1,
  semanaDelGrupo: 2,
  titulo: 'Semana 2 · Examen 1',
  totalPreguntas: 2,
  ventana: ventanas.abierta,
  miIntento: null,
  ...cambios,
});

/** Boleta de una materia con las calificaciones dadas (null = no presentado). */
export const boletaMateria = (materiaId: string, calificaciones: (number | null)[]): BoletaMateria => {
  const notas = [
    [1, 1],
    [1, 2],
    [2, 1],
    [2, 2],
  ].map(([semana, numero], i) => ({ semana, numero, calificacion: calificaciones[i] ?? null }));
  const promedio = Math.round((notas.reduce((s, n) => s + (n.calificacion ?? 0), 0) / 4) * 10) / 10;
  return { materiaId, notas, promedio, aprobada: promedio >= 6, completa: notas.every((n) => n.calificacion !== null) };
};
