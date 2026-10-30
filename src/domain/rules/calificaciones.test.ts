import { describe, expect, it } from 'vitest';
import type { CalificacionesAlumno } from '../entities/Calificaciones';
import { formatearNota, mejorNota, porcentajeNota, semanasCalificadas } from './calificaciones';

describe('notas', () => {
  it('compara en porcentaje aunque el puntaje máximo sea distinto', () => {
    expect(porcentajeNota({ calificacion: 8, puntajeMaximo: 10 })).toBe(80);
    expect(mejorNota({ calificacion: 8, puntajeMaximo: 10 }, { calificacion: 85, puntajeMaximo: 100 })).toEqual({
      calificacion: 85,
      puntajeMaximo: 100,
    });
    expect(mejorNota({ calificacion: 9, puntajeMaximo: 10 }, { calificacion: 85, puntajeMaximo: 100 })).toEqual({
      calificacion: 9,
      puntajeMaximo: 10,
    });
    expect(mejorNota(null, { calificacion: 5, puntajeMaximo: 10 })).toEqual({ calificacion: 5, puntajeMaximo: 10 });
    expect(mejorNota(null, null)).toBeNull();
    expect(porcentajeNota({ calificacion: 5, puntajeMaximo: 0 })).toBe(0);
  });

  it('formatea la nota o un guion si no hay', () => {
    expect(formatearNota({ calificacion: 66.666, puntajeMaximo: 100 })).toBe('66.67 / 100');
    expect(formatearNota(null)).toBe('—');
  });
});

describe('semanasCalificadas', () => {
  const alumno = (id: string, semanas: number[]): CalificacionesAlumno => ({
    alumno: { id, nombre: id },
    semanas: semanas.map((semana) => ({ semana, semanal: null, reposicion: null, mejor: null })),
    final: null,
  });

  it('une y ordena las semanas de todos los alumnos', () => {
    expect(semanasCalificadas([alumno('a', [3, 1]), alumno('b', [2, 1])])).toEqual([1, 2, 3]);
    expect(semanasCalificadas([])).toEqual([]);
  });
});
