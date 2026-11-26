import { describe, expect, it } from 'vitest';
import { boletaMateria } from '../../test/datos';
import { boletaDeMateria, estaAprobada, formatearNota, situacionDeMateria } from './calificaciones';
import { esLunes } from './fechas';

describe('calificaciones', () => {
  it('formatea con un decimal o un guion si no hay', () => {
    expect(formatearNota(8.25)).toBe('8.3');
    expect(formatearNota(10)).toBe('10');
    expect(formatearNota(0)).toBe('0');
    expect(formatearNota(null)).toBe('—');
    expect(formatearNota(undefined)).toBe('—');
  });

  it('se aprueba con 6', () => {
    expect(estaAprobada(6)).toBe(true);
    expect(estaAprobada(5.9)).toBe(false);
  });

  it('una materia sigue en curso mientras le falten exámenes', () => {
    expect(situacionDeMateria(boletaMateria('m1', [10, 10, null, null]))).toBe('en-curso');
    expect(situacionDeMateria(boletaMateria('m1', [8, 7, 6, 9]))).toBe('aprobada');
    expect(situacionDeMateria(boletaMateria('m1', [5, 5, 5, 5]))).toBe('reprobada');
  });

  it('busca la boleta de una materia', () => {
    const boleta = { alumno: { id: 'a', nombre: 'A' }, materias: [boletaMateria('m2', [])], promedioGeneral: 0 };
    expect(boletaDeMateria(boleta, 'm2')?.materiaId).toBe('m2');
    expect(boletaDeMateria(boleta, 'm1')).toBeUndefined();
    expect(boletaDeMateria(undefined, 'm1')).toBeUndefined();
  });
});

describe('esLunes', () => {
  it('reconoce los lunes sin depender de la zona horaria', () => {
    expect(esLunes('2026-08-03')).toBe(true);
    expect(esLunes('2026-08-04')).toBe(false);
    expect(esLunes('2026-8-3')).toBe(false);
  });
});
