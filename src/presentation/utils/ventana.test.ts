import { describe, expect, it } from 'vitest';
import type { Ventana } from '../../domain/entities/Examen';
import { describirVentana } from './ventana';

// Mediodía UTC: la fecha de calendario es la misma en cualquier zona horaria de América o Europa.
const ventana: Ventana = { abre: '2026-08-10T12:00:00.000Z', cierra: '2026-08-16T12:00:00.000Z', estado: 'abierta' };

describe('describirVentana', () => {
  it('antes de abrir indica la fecha de apertura', () => {
    expect(describirVentana(ventana, new Date('2026-08-01T00:00:00Z'))).toMatch(/^Abre el 10 de agosto de 2026/);
  });

  it('abierta indica hasta cuándo está disponible', () => {
    expect(describirVentana(ventana, new Date('2026-08-12T00:00:00Z'))).toMatch(/^Disponible hasta el 16 de agosto de 2026/);
  });

  it('después de cerrar dice "Cerrado"', () => {
    expect(describirVentana(ventana, new Date('2026-08-20T00:00:00Z'))).toBe('Cerrado');
  });
});

