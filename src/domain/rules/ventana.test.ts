import { describe, expect, it } from 'vitest';
import type { Ventana } from '../entities/Examen';
import { estadoDeVentana, puedeResponder } from './ventana';

const ventana: Ventana = { abre: '2026-08-10T00:00:00.000Z', cierra: '2026-08-16T23:59:59.000Z', estado: 'abierta' };

describe('estadoDeVentana', () => {
  it('calcula próxima, abierta y cerrada según la fecha actual', () => {
    expect(estadoDeVentana(ventana, new Date('2026-08-09T23:59:00Z'))).toBe('proxima');
    expect(estadoDeVentana(ventana, new Date('2026-08-10T00:00:00Z'))).toBe('abierta');
    expect(estadoDeVentana(ventana, new Date('2026-08-16T23:59:59Z'))).toBe('abierta');
    expect(estadoDeVentana(ventana, new Date('2026-08-17T00:00:00Z'))).toBe('cerrada');
  });

  it('usa el estado del backend si las fechas no son válidas', () => {
    expect(estadoDeVentana({ abre: 'x', cierra: 'y', estado: 'proxima' }, new Date())).toBe('proxima');
  });
});

describe('puedeResponder', () => {
  const ahora = new Date('2026-08-12T12:00:00Z');
  it('solo con la ventana abierta y sin intento previo', () => {
    expect(puedeResponder({ ventana, miIntento: null }, ahora)).toBe(true);
    expect(puedeResponder({ ventana }, ahora)).toBe(true);
    expect(puedeResponder({ ventana, miIntento: { aciertos: 1, totalPreguntas: 1, calificacion: 10, fecha: '' } }, ahora)).toBe(false);
    expect(puedeResponder({ ventana, miIntento: null }, new Date('2026-08-20T00:00:00Z'))).toBe(false);
  });
});
