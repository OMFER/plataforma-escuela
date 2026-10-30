import { describe, expect, it } from 'vitest';
import {
  contarRespondidas,
  estanTodasRespondidas,
  fechaLimiteVencida,
  formatearCalificacion,
  preguntasIguales,
  validarPregunta,
} from './examen';
import { esUrlHttp } from './urls';

describe('estanTodasRespondidas', () => {
  it('es true solo si cada pregunta tiene una opción', () => {
    expect(estanTodasRespondidas([0, 2, 1], 3)).toBe(true);
    expect(estanTodasRespondidas([0, null, 1], 3)).toBe(false);
    expect(estanTodasRespondidas([0, 1], 3)).toBe(false);
    expect(estanTodasRespondidas([0, undefined, 1], 3)).toBe(false);
    expect(estanTodasRespondidas([], 0)).toBe(false);
    expect(estanTodasRespondidas([-1], 1)).toBe(false);
  });

  it('cuenta las respondidas', () => {
    expect(contarRespondidas([0, null, 3, undefined])).toBe(2);
  });
});

describe('formatearCalificacion', () => {
  it('redondea a dos decimales', () => {
    expect(formatearCalificacion(66.66666, 100)).toBe('66.67 / 100');
    expect(formatearCalificacion(10, 10)).toBe('10 / 10');
  });
});

describe('fechaLimiteVencida', () => {
  const ahora = new Date('2026-08-10T12:00:00Z');
  it('compara contra la fecha actual', () => {
    expect(fechaLimiteVencida(undefined, ahora)).toBe(false);
    expect(fechaLimiteVencida('2026-08-10T11:59:00Z', ahora)).toBe(true);
    expect(fechaLimiteVencida('2026-08-11T00:00:00Z', ahora)).toBe(false);
  });
});

describe('validarPregunta', () => {
  it('acepta una pregunta correcta', () => {
    expect(validarPregunta({ enunciado: '¿2+2?', opciones: ['3', '4'], respuestaCorrecta: 1 })).toEqual([]);
  });

  it('reporta enunciado vacío, opciones fuera de rango y respuesta inválida', () => {
    expect(validarPregunta({ enunciado: ' ', opciones: ['a'], respuestaCorrecta: 3 })).toHaveLength(3);
    expect(validarPregunta({ enunciado: 'x', opciones: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], respuestaCorrecta: 0 })).toHaveLength(1);
    expect(validarPregunta({ enunciado: 'x', opciones: ['a', ''], respuestaCorrecta: 0 })).toEqual(['Ninguna opción puede estar vacía.']);
  });
});

describe('preguntasIguales', () => {
  const base = [{ enunciado: 'P1', opciones: ['a', 'b'], respuestaCorrecta: 0 }];
  it('ignora espacios pero detecta cambios reales', () => {
    expect(preguntasIguales(base, [{ enunciado: ' P1 ', opciones: ['a ', 'b'], respuestaCorrecta: 0 }])).toBe(true);
    expect(preguntasIguales(base, [{ enunciado: 'P1', opciones: ['a', 'b'], respuestaCorrecta: 1 }])).toBe(false);
    expect(preguntasIguales(base, [{ enunciado: 'P1', opciones: ['a', 'c'], respuestaCorrecta: 0 }])).toBe(false);
    expect(preguntasIguales(base, [])).toBe(false);
  });
});

describe('esUrlHttp', () => {
  it('solo acepta http(s)', () => {
    expect(esUrlHttp('https://drive.google.com/x')).toBe(true);
    expect(esUrlHttp('http://a.mx')).toBe(true);
    expect(esUrlHttp('javascript:alert(1)')).toBe(false);
    expect(esUrlHttp('ftp://a.mx')).toBe(false);
    expect(esUrlHttp('sin esquema')).toBe(false);
  });
});
