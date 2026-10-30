import { describe, expect, it } from 'vitest';
import { describirAvance, faseDelCurso, formatearRangoSemana, porcentajeAvance, semanaSugerida } from './semanas';

describe('formatearRangoSemana', () => {
  it('usa formato corto cuando el rango está en el mismo mes', () => {
    expect(formatearRangoSemana('2026-08-03T00:00:00.000Z', '2026-08-09T00:00:00.000Z')).toBe('3–9 ago');
  });

  it('muestra ambos meses cuando el rango los cruza', () => {
    expect(formatearRangoSemana('2026-07-28T00:00:00.000Z', '2026-08-03T00:00:00.000Z')).toBe('28 jul – 3 ago');
  });

  it('muestra los años cuando el rango cruza de año', () => {
    expect(formatearRangoSemana('2025-12-29T00:00:00.000Z', '2026-01-04T00:00:00.000Z')).toBe('29 dic 2025 – 4 ene 2026');
  });

  it('no se desplaza por la zona horaria (usa la fecha de calendario UTC)', () => {
    expect(formatearRangoSemana('2026-08-03T00:00:00.000Z', '2026-08-09T23:59:59.999Z')).toBe('3–9 ago');
  });

  it('devuelve cadena vacía con fechas inválidas', () => {
    expect(formatearRangoSemana('x', '2026-08-09')).toBe('');
  });
});

describe('avance del curso', () => {
  it('distingue las fases según semanaActual', () => {
    expect(faseDelCurso(0, 16)).toBe('por-iniciar');
    expect(faseDelCurso(5, 16)).toBe('en-curso');
    expect(faseDelCurso(17, 16)).toBe('finalizado');
  });

  it('describe "Semana X de N"', () => {
    expect(describirAvance(3, 16)).toBe('Semana 3 de 16');
    expect(describirAvance(0, 16)).toMatch(/Aún no comienza/);
    expect(describirAvance(17, 16)).toMatch(/Curso finalizado/);
  });

  it('calcula el porcentaje de semanas transcurridas', () => {
    expect(porcentajeAvance(0, 16)).toBe(0);
    expect(porcentajeAvance(1, 16)).toBe(0);
    expect(porcentajeAvance(9, 16)).toBe(50);
    expect(porcentajeAvance(17, 16)).toBe(100);
  });

  it('sugiere una semana dentro del rango válido', () => {
    expect(semanaSugerida({ semanaActual: 0, totalSemanas: 16 })).toBe(1);
    expect(semanaSugerida({ semanaActual: 7, totalSemanas: 16 })).toBe(7);
    expect(semanaSugerida({ semanaActual: 17, totalSemanas: 16 })).toBe(16);
  });
});
