import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { sesionAdmin } from '../test/datos';
import { grupoEjemplo, planEjemplo, sembrarPlan, usuarioAdmin, usuarioMaestro } from '../test/fakes';
import { renderApp } from '../test/renderApp';

const abrirPestana = async (usuario: ReturnType<typeof userEvent.setup>, nombre: RegExp) =>
  usuario.click(await screen.findByRole('tab', { name: nombre }));

describe('administración: planes de estudio', () => {
  it('crea un plan en borrador y lleva a armarlo', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/admin', { sesion: sesionAdmin });
    await abrirPestana(usuario, /Planes de estudio/);

    await usuario.type(screen.getByLabelText('Nombre'), 'Bachillerato');
    await usuario.click(screen.getByRole('button', { name: /Crear plan/ }));

    expect(await screen.findByText(/Plan «Bachillerato» creado/)).toBeInTheDocument();
    expect(repos.planes.creados).toEqual([{ nombre: 'Bachillerato' }]);
    const enlace = await screen.findByRole('link', { name: /Bachillerato\s*versión 1\s*Borrador/ });
    expect(enlace).toHaveAttribute('href', '/admin/planes/p1');
  });

  it('en borrador agrega materias por bloque, dice qué falta y publica cuando está completo', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/admin/planes/p1', {
      sesion: sesionAdmin,
      preparar: (r) => {
        sembrarPlan(r, { estado: 'borrador', publicadoEn: undefined });
        r.usuarios.lista.push(usuarioMaestro);
        r.planes.pendientes.p1 = ['Historia: no tiene maestro asignado'];
      },
    });

    expect(await screen.findByRole('heading', { name: 'Prepa intensiva' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bloque 1 · Semanas 1 y 2' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bloque 2 · Semanas 3 y 4' })).toBeInTheDocument();
    const historia = screen.getByRole('article', { name: 'Historia' });
    expect(within(historia).getByText('Sin maestro asignado')).toBeInTheDocument();
    expect(within(historia).getByRole('link', { name: /Contenido y exámenes/ })).toHaveAttribute('href', '/materias/m2');

    const pendientes = await screen.findByRole('list', { name: 'Pendientes' });
    expect(pendientes).toHaveTextContent('Historia: no tiene maestro asignado');
    expect(screen.getByRole('button', { name: /Publicar plan/ })).toBeDisabled();

    // Agrega una materia en el bloque 3 con maestro
    const formulario = screen.getByRole('button', { name: /Agregar materia/ }).closest('form')!;
    await usuario.type(within(formulario).getByLabelText('Nombre'), 'Física');
    await usuario.selectOptions(within(formulario).getByLabelText('Bloque'), '3');
    await usuario.selectOptions(await within(formulario).findByLabelText('Maestro'), 'u2');
    await usuario.click(within(formulario).getByRole('button', { name: /Agregar materia/ }));
    expect(await screen.findByText('Materia «Física» agregada.')).toBeInTheDocument();
    expect(repos.materias.creadas).toEqual([{ planId: 'p1', nombre: 'Física', bloque: 3, maestroId: 'u2' }]);
    expect(await screen.findByRole('heading', { name: 'Bloque 3 · Semanas 5 y 6' })).toBeInTheDocument();

    // Ya completo: se publica tras confirmar
    repos.planes.pendientes.p1 = [];
    await usuario.click(within(historia).getByRole('button', { name: /Quitar/ }));
    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, eliminar' }));
    expect(await screen.findByText('El plan está completo y listo para publicarse.')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: /Publicar plan/ }));
    const dialogo = screen.getByRole('dialog', { name: '¿Publicar Prepa intensiva · versión 1?' });
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, publicar' }));
    expect(await screen.findByRole('note')).toHaveTextContent(/Este plan está publicado/);
    expect(repos.planes.lista[0]?.estado).toBe('publicado');
  });

  it('publicado: no deja agregar ni quitar materias, y su bloque queda fijo al editar', async () => {
    const usuario = userEvent.setup();
    renderApp('/admin/planes/p1', { sesion: sesionAdmin, preparar: (r) => sembrarPlan(r) });
    const mate = await screen.findByRole('article', { name: 'Matemáticas' });
    expect(screen.queryByRole('button', { name: /Agregar materia/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Publicar plan/ })).not.toBeInTheDocument();
    expect(within(mate).queryByRole('button', { name: /Quitar/ })).not.toBeInTheDocument();

    await usuario.click(within(mate).getByRole('button', { name: /Editar/ }));
    expect(within(mate).getByLabelText('Bloque')).toBeDisabled();
  });

  it('crea una nueva versión y la abre', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/admin/planes/p1', { sesion: sesionAdmin, preparar: (r) => sembrarPlan(r) });
    await usuario.click(await screen.findByRole('button', { name: /Crear nueva versión/ }));
    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, crear' }));
    expect(await screen.findByText('Versión 2')).toBeInTheDocument();
    expect(screen.getByText('Borrador')).toBeInTheDocument();
    expect(repos.planes.lista.map((p) => p.version)).toEqual([1, 2]);
  });

  it('no deja borrar un plan con grupos y muestra por qué', async () => {
    const usuario = userEvent.setup();
    renderApp('/admin/planes/p1', {
      sesion: sesionAdmin,
      preparar: (r) => {
        sembrarPlan(r);
        r.planes.conGrupos.add('p1');
      },
    });
    await usuario.click(await screen.findByRole('button', { name: /Eliminar plan/ }));
    const dialogo = screen.getByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, eliminar' }));
    expect(await within(dialogo).findByText(/tiene grupos/)).toBeInTheDocument();
  });

  it('muestra el historial de cambios con su autor y cómo estaba antes', async () => {
    const usuario = userEvent.setup();
    renderApp('/admin/planes/p1', {
      sesion: sesionAdmin,
      preparar: (r) => {
        sembrarPlan(r);
        r.usuarios.lista.push(usuarioAdmin, usuarioMaestro);
        r.planes.cambios.p1 = [
          {
            id: 'c1',
            entidad: 'examen',
            entidadId: 'e1',
            accion: 'actualizar',
            autorId: 'u2',
            fecha: '2026-08-12T15:00:00.000Z',
            antes: { titulo: 'Repaso' },
            despues: { titulo: 'Repaso corregido' },
          },
        ];
      },
    });
    await usuario.click(await screen.findByRole('button', { name: /Ver historial/ }));
    const historial = await screen.findByRole('list', { name: 'Historial de cambios' });
    expect(await within(historial).findByText(/Carlos Ruiz/)).toBeInTheDocument();
    expect(historial).toHaveTextContent('corrigió un examen «Repaso corregido»');
    expect(historial).toHaveTextContent('"titulo": "Repaso"');
  });
});

describe('administración: grupos', () => {
  it('crea un grupo con un plan publicado y una fecha en lunes', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/admin', {
      sesion: sesionAdmin,
      preparar: (r) => {
        sembrarPlan(r);
        r.planes.lista.push({ id: 'p9', nombre: 'Otro', version: 1, estado: 'borrador' });
      },
    });
    await abrirPestana(usuario, /Grupos/);

    await usuario.click(screen.getByRole('button', { name: /Crear grupo/ }));
    expect(await screen.findByText('Elige un plan publicado.')).toBeInTheDocument();

    const plan = await screen.findByLabelText('Plan de estudios');
    expect(within(plan).queryByRole('option', { name: /Otro/ })).not.toBeInTheDocument();
    await usuario.selectOptions(plan, 'p1');
    await usuario.type(screen.getByLabelText('Nombre del grupo'), 'Generación 1');
    await usuario.type(screen.getByLabelText('Fecha de inicio'), '2026-08-04');
    await usuario.click(screen.getByRole('button', { name: /Crear grupo/ }));
    expect(await screen.findByText('La fecha de inicio debe ser un lunes.')).toBeInTheDocument();
    expect(repos.grupos.creados).toHaveLength(0);

    await usuario.clear(screen.getByLabelText('Fecha de inicio'));
    await usuario.type(screen.getByLabelText('Fecha de inicio'), '2026-08-03');
    await usuario.click(screen.getByRole('button', { name: /Crear grupo/ }));
    expect(await screen.findByText('Grupo Generación 1 creado.')).toBeInTheDocument();
    expect(repos.grupos.creados).toEqual([{ planId: 'p1', nombre: 'Generación 1', fechaInicio: '2026-08-03' }]);
  });

  it('muestra el plan del grupo y elimina tras explicar que el plan se conserva', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/admin', { sesion: sesionAdmin, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    await abrirPestana(usuario, /Grupos/);

    const tarjeta = await screen.findByRole('article', { name: 'Grupo Generación agosto' });
    expect(tarjeta).toHaveTextContent(`${planEjemplo.nombre} · versión 1`);
    expect(tarjeta).toHaveTextContent('Semana 2 de 4');
    expect(within(tarjeta).getByRole('link', { name: /Calificaciones/ })).toHaveAttribute('href', '/grupos/g1/calificaciones');
    await usuario.click(within(tarjeta).getByRole('button', { name: /Eliminar/ }));
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent(/inscripciones de los alumnos y todas las calificaciones/);
    expect(dialogo).toHaveTextContent(/El plan de estudios, su contenido y sus exámenes no se borran/);
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, eliminar' }));

    expect(await screen.findByText('Aún no hay grupos.')).toBeInTheDocument();
    expect(repos.grupos.lista).toHaveLength(0);
  });

  it('inscribe y da de baja alumnos del grupo', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/admin', {
      sesion: sesionAdmin,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.usuarios.lista.push({ id: 'a1', nombre: 'Luis Mora', correo: 'luis@escuela.mx', rol: 'alumno' });
      },
    });
    await abrirPestana(usuario, /Grupos/);

    await usuario.click(await screen.findByRole('button', { name: /Alumnos/ }));
    await usuario.click(await screen.findByRole('checkbox'));
    await usuario.click(screen.getByRole('button', { name: /Inscribir \(1\)/ }));
    expect(await screen.findByRole('button', { name: 'Dar de baja' })).toBeInTheDocument();
    expect(repos.grupos.alumnos.g1?.map((a) => a.id)).toEqual(['a1']);

    await usuario.click(screen.getByRole('button', { name: 'Dar de baja' }));
    expect(await screen.findByText('Sin alumnos inscritos.')).toBeInTheDocument();
  });
});
