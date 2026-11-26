import type { Grupo, Semana } from '../entities/Grupo';
import type { MateriaConMaestro } from '../entities/Materia';
import { SEMANAS_POR_MATERIA } from '../entities/Plan';

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

interface FechaCalendario {
  dia: number;
  mes: number;
  anio: number;
}

/** Se usan componentes UTC: el backend envía fechas de calendario en ISO (medianoche de la escuela, antes del mediodía UTC). */
const aFechaCalendario = (iso: string): FechaCalendario | null => {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  return { dia: fecha.getUTCDate(), mes: fecha.getUTCMonth(), anio: fecha.getUTCFullYear() };
};

/** "3–9 ago", "28 jul – 3 ago" o "29 dic 2025 – 4 ene 2026". */
export const formatearRangoSemana = (inicioIso: string, finIso: string): string => {
  const inicio = aFechaCalendario(inicioIso);
  const fin = aFechaCalendario(finIso);
  if (!inicio || !fin) return '';

  if (inicio.anio !== fin.anio) {
    return `${inicio.dia} ${MESES_CORTOS[inicio.mes]} ${inicio.anio} – ${fin.dia} ${MESES_CORTOS[fin.mes]} ${fin.anio}`;
  }
  if (inicio.mes !== fin.mes) {
    return `${inicio.dia} ${MESES_CORTOS[inicio.mes]} – ${fin.dia} ${MESES_CORTOS[fin.mes]}`;
  }
  return `${inicio.dia}–${fin.dia} ${MESES_CORTOS[fin.mes]}`;
};

export type FaseCurso = 'por-iniciar' | 'en-curso' | 'finalizado';

export const faseDelCurso = (semanaActual: number, totalSemanas: number): FaseCurso => {
  if (semanaActual <= 0) return 'por-iniciar';
  if (semanaActual > totalSemanas) return 'finalizado';
  return 'en-curso';
};

/** "Semana X de N" o un texto equivalente cuando el curso no ha empezado o ya terminó. */
export const describirAvance = (semanaActual: number, totalSemanas: number): string => {
  switch (faseDelCurso(semanaActual, totalSemanas)) {
    case 'por-iniciar':
      return `Aún no comienza · ${totalSemanas} semanas`;
    case 'finalizado':
      return `Curso finalizado · ${totalSemanas} semanas`;
    default:
      return `Semana ${semanaActual} de ${totalSemanas}`;
  }
};

/** Porcentaje de semanas transcurridas (0–100). */
export const porcentajeAvance = (semanaActual: number, totalSemanas: number): number => {
  if (totalSemanas <= 0) return 0;
  if (semanaActual > totalSemanas) return 100;
  const completadas = Math.min(Math.max(semanaActual - 1, 0), totalSemanas);
  return Math.round((completadas / totalSemanas) * 100);
};

/** Semana a la que conviene llevar al usuario al entrar al grupo. */
export const semanaSugerida = (semanaActual: number, totalSemanas: number): number =>
  Math.min(Math.max(semanaActual, 1), Math.max(totalSemanas, 1));

export const esSemanaValida = (semana: number, totalSemanas: number): boolean =>
  Number.isInteger(semana) && semana >= 1 && semana <= totalSemanas;

export const buscarSemana = (semanas: Semana[], numero: number): Semana | undefined =>
  semanas.find((s) => s.numero === numero);

/** Semana del grupo en la que cae la semana `semanaDeMateria` de una materia del `bloque`. */
export const semanaDelGrupo = (bloque: number, semanaDeMateria: number): number =>
  (bloque - 1) * SEMANAS_POR_MATERIA + semanaDeMateria;

/** Bloque que se cursa en una semana del grupo. */
export const bloqueDeSemana = (semana: number): number => Math.floor((semana - 1) / SEMANAS_POR_MATERIA) + 1;

/** Qué semana de la materia (1 o 2) es una semana del grupo. */
export const semanaDeMateria = (semana: number): number => ((semana - 1) % SEMANAS_POR_MATERIA) + 1;

/** Materias que se cursan en una semana del grupo (las de su bloque). */
export const materiasDeSemana = (grupo: Pick<Grupo, 'materias'>, semana: number): MateriaConMaestro[] =>
  grupo.materias.filter((m) => m.bloque === bloqueDeSemana(semana));

/** Materias agrupadas por bloque, en orden: [[bloque 1…], [bloque 2…]]. */
export const agruparPorBloque = <T extends { bloque: number }>(materias: T[]): { bloque: number; materias: T[] }[] =>
  [...new Set(materias.map((m) => m.bloque))]
    .sort((a, b) => a - b)
    .map((bloque) => ({ bloque, materias: materias.filter((m) => m.bloque === bloque) }));

/** "Semanas 3 y 4" para el bloque 2. */
export const describirBloque = (bloque: number): string => {
  const primera = semanaDelGrupo(bloque, 1);
  return `Semanas ${primera} y ${primera + SEMANAS_POR_MATERIA - 1}`;
};
