import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CalificacionesAlumno } from '../domain/entities/Calificaciones';
import { grupoEjemplo } from '../test/fakes';
import { sesionAlumno, sesionMaestro } from '../test/datos';
import { renderApp } from '../test/renderApp';

const nota = (calificacion: number) => ({ calificacion, puntajeMaximo: 10 });

const calificacionesAna: CalificacionesAlumno = {
  alumno: { id: 'u1', nombre: 'Ana López', correo: 'ana@escuela.mx' },
  semanas: [
    { semana: 1, semanal: nota(5), reposicion: nota(9), mejor: nota(9) },
    { semana: 2, semanal: nota(7), reposicion: null, mejor: nota(7) },
  ],
  final: null,
};

const calificacionesBeto: CalificacionesAlumno = {
  alumno: { id: 'u4', nombre: 'Beto Gil', correo: 'beto@escuela.mx' },
  semanas: [{ semana: 1, semanal: nota(10), reposicion: null, mejor: nota(10) }],
  final: nota(8),
};

const filas = () => screen.getAllByRole('row').slice(1);

describe('calificaciones', () => {
  it('el alumno ve su tabla por semana (semanal, reposición y mejor) y el final', async () => {
    renderApp('/grupos/g1/calificaciones', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.grupos.calificaciones.g1 = [calificacionesAna];
      },
    });

    expect(await screen.findByRole('heading', { name: 'Mis calificaciones' })).toBeInTheDocument();
    await screen.findByRole('table');
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Semana', 'Semanal', 'Reposición', 'Mejor']);
    const [semana1, semana2] = filas();
    expect(within(semana1!).getAllByRole('cell').map((c) => c.textContent)).toEqual(['5 / 10', '9 / 10', '9 / 10']);
    expect(within(semana2!).getAllByRole('cell').map((c) => c.textContent)).toEqual(['7 / 10', '—', '7 / 10']);
    expect(screen.getByText(/Examen final:/)).toHaveTextContent('Examen final: —');
  });

  it('el maestro ve a todos los alumnos con la mejor nota por semana y el final', async () => {
    renderApp('/grupos/g1/calificaciones', {
      sesion: sesionMaestro,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.grupos.calificaciones.g1 = [calificacionesBeto, calificacionesAna];
      },
    });

    expect(await screen.findByRole('heading', { name: 'Calificaciones del grupo' })).toBeInTheDocument();
    await screen.findByRole('table');
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Alumno', 'Sem. 1', 'Sem. 2', 'Final']);
    const [ana, beto] = filas();
    expect(within(ana!).getByRole('rowheader')).toHaveTextContent('Ana López');
    expect(within(ana!).getAllByRole('cell').map((c) => c.textContent)).toEqual(['9 / 10', '7 / 10', '—']);
    expect(within(beto!).getAllByRole('cell').map((c) => c.textContent)).toEqual(['10 / 10', '—', '8 / 10']);
  });

  it('sin alumnos inscritos lo indica', async () => {
    renderApp('/grupos/g1/calificaciones', { sesion: sesionMaestro, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    expect(await screen.findByText('Aún no hay alumnos inscritos en este grupo.')).toBeInTheDocument();
  });
});
