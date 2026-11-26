import { describe, expect, it } from 'vitest';
import {
  contarRespondidas,
  estanTodasRespondidas,
  formatearCalificacion,
  casillasDeExamen,
  esCorreccionDeTexto,
  preguntasIguales,
  revisionDe,
  validarDiasExtra,
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
  it('muestra la calificación sobre 10 con hasta dos decimales', () => {
    expect(formatearCalificacion(6.66666)).toBe('6.67 / 10');
    expect(formatearCalificacion(10)).toBe('10 / 10');
  });
});

describe('casillas de examen', () => {
  it('dos semanas con dos exámenes cada una', () => {
    expect(casillasDeExamen()).toEqual([
      { semana: 1, numero: 1 },
      { semana: 1, numero: 2 },
      { semana: 2, numero: 1 },
      { semana: 2, numero: 2 },
    ]);
  });
});

describe('esCorreccionDeTexto', () => {
  const antes = [{ enunciado: '¿Color?', opciones: ['Rojo', 'Azul'], respuestaCorrecta: 1 }];

  it('acepta cambios de redacción', () => {
    expect(esCorreccionDeTexto(antes, [{ enunciado: '¿De qué color?', opciones: ['Rojo', 'Azul cielo'], respuestaCorrecta: 1 }])).toBe(true);
  });

  it('rechaza cambiar la respuesta, las opciones o las preguntas', () => {
    expect(esCorreccionDeTexto(antes, [{ ...antes[0], respuestaCorrecta: 0 }])).toBe(false);
    expect(esCorreccionDeTexto(antes, [{ ...antes[0], opciones: ['Rojo', 'Azul', 'Verde'] }])).toBe(false);
    expect(esCorreccionDeTexto(antes, [...antes, ...antes])).toBe(false);
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

describe('validarDiasExtra', () => {
  it('acepta de 0 a 30 días enteros', () => {
    expect(validarDiasExtra(undefined)).toEqual([]);
    expect(validarDiasExtra(30)).toEqual([]);
    expect(validarDiasExtra(31)).toHaveLength(1);
    expect(validarDiasExtra(-1)).toHaveLength(1);
    expect(validarDiasExtra(1.5)).toHaveLength(1);
  });
});

describe('revisionDe', () => {
  const revisada = { id: 'p1', enunciado: 'A', opciones: ['x', 'y'], respuestaCorrecta: 1, miRespuesta: 0, acierto: false };

  it('devuelve las preguntas cuando todas traen la revisión completa', () => {
    expect(revisionDe([revisada])).toEqual([revisada]);
  });

  it('devuelve vacío si alguna pregunta no trae revisión o no hay preguntas', () => {
    expect(revisionDe([])).toEqual([]);
    expect(revisionDe([revisada, { id: 'p2', enunciado: 'B', opciones: ['x', 'y'] }])).toEqual([]);
  });
});
