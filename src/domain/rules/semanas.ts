import type { Materia, Semana } from '../entities/Materia';

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

interface FechaCalendario {
  dia: number;
  mes: number;
  anio: number;
}

/** Se usan componentes UTC: el backend envía fechas de calendario en ISO (medianoche UTC). */
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
  const completadas = Math.min(Math.max(semanaActual - 1, 0), totalSemanas);
  if (semanaActual > totalSemanas) return 100;
  return Math.round((completadas / totalSemanas) * 100);
};

/** Semana a la que conviene llevar al usuario al entrar a la materia. */
export const semanaSugerida = (materia: Pick<Materia, 'semanaActual' | 'totalSemanas'>): number =>
  Math.min(Math.max(materia.semanaActual, 1), Math.max(materia.totalSemanas, 1));

export const esSemanaValida = (semana: number, totalSemanas: number): boolean =>
  Number.isInteger(semana) && semana >= 1 && semana <= totalSemanas;

export const buscarSemana = (semanas: Semana[], numero: number): Semana | undefined =>
  semanas.find((s) => s.numero === numero);
