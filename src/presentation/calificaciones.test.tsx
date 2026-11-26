import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CalificacionesGrupo } from '../domain/entities/Calificaciones';
import { boletaMateria, sesionAdmin, sesionAlumno, sesionMaestro } from '../test/datos';
import { grupoEjemplo } from '../test/fakes';
import { renderApp } from '../test/renderApp';

const materias = [
  { id: 'm1', nombre: 'Matemáticas', bloque: 1 },
  { id: 'm2', nombre: 'Historia', bloque: 1 },
  { id: 'm3', nombre: 'Química', bloque: 2 },
];

const ana = {
  alumno: { id: 'u1', nombre: 'Ana López', correo: 'ana@escuela.mx' },
  materias: [boletaMateria('m1', [8, 9, 7, 6]), boletaMateria('m2', [5, 5, 4, 6]), boletaMateria('m3', [10])],
  promedioGeneral: 4.9,
};
const beto = {
  alumno: { id: 'u4', nombre: 'Beto Gil', correo: 'beto@escuela.mx' },
  materias: [boletaMateria('m1', [10, 10, 10, 10]), boletaMateria('m2', []), boletaMateria('m3', [])],
  promedioGeneral: 3.3,
};

const sembrar = (calificaciones: CalificacionesGrupo) => ({
  preparar: (r: { grupos: { lista: unknown[]; calificaciones: Record<string, CalificacionesGrupo> } }) => {
    r.grupos.lista.push(grupoEjemplo);
    r.grupos.calificaciones.g1 = calificaciones;
  },
});

const filas = async () => (await screen.findAllByRole('row')).slice(1);

describe('calificaciones', () => {
  it('el alumno ve sus 4 exámenes por materia, el promedio, si aprobó y su promedio general', async () => {
    renderApp('/grupos/g1/calificaciones', { sesion: sesionAlumno, ...sembrar({ materias, boletas: [ana] }) });
    expect(await screen.findByRole('heading', { name: 'Mis calificaciones' })).toBeInTheDocument();
    expect(screen.getByText(/Grupo Generación agosto/)).toBeInTheDocument();

    const [mate, historia, quimica] = await filas();
    expect(within(mate!).getAllByRole('cell').map((c) => c.textContent)).toEqual(['8', '9', '7', '6', '7.5', 'Aprobada']);
    expect(within(historia!).getAllByRole('cell').map((c) => c.textContent)).toEqual(['5', '5', '4', '6', '5', 'Reprobada']);
    expect(within(quimica!).getAllByRole('cell').map((c) => c.textContent)).toEqual(['10', '—', '—', '—', '2.5', 'En curso']);
    expect(screen.getByText(/Promedio general:/)).toHaveTextContent('Promedio general: 4.9');
  });

  it('el maestro ve a cada alumno con el promedio de cada materia y el general', async () => {
    renderApp('/grupos/g1/calificaciones', { sesion: sesionMaestro, ...sembrar({ materias, boletas: [ana, beto] }) });
    expect(await screen.findByRole('heading', { name: 'Calificaciones del grupo' })).toBeInTheDocument();
    expect((await screen.findAllByRole('columnheader')).map((c) => c.textContent)).toEqual([
      'Alumno',
      'Matemáticas',
      'Historia',
      'Química',
      'General',
    ]);
    const [filaAna, filaBeto] = await filas();
    expect(within(filaAna!).getAllByRole('cell').map((c) => c.textContent)).toEqual(['7.5', '5', '2.5', '4.9']);
    // Historia ya terminó sin aprobar: se marca en rojo
    expect(within(filaAna!).getAllByRole('cell')[1]).toHaveClass('text-error');
    expect(within(filaBeto!).getAllByRole('cell').map((c) => c.textContent)).toEqual(['10', '0', '0', '3.3']);
  });

  it('el admin también puede consultarlas', async () => {
    renderApp('/grupos/g1/calificaciones', { sesion: sesionAdmin, ...sembrar({ materias, boletas: [ana] }) });
    expect(await screen.findByRole('heading', { name: 'Calificaciones del grupo' })).toBeInTheDocument();
  });

  it('sin alumnos inscritos lo indica', async () => {
    renderApp('/grupos/g1/calificaciones', { sesion: sesionMaestro, ...sembrar({ materias, boletas: [] }) });
    expect(await screen.findByText('Aún no hay alumnos inscritos en este grupo.')).toBeInTheDocument();
  });
});
