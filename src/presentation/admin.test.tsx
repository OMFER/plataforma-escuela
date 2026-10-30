import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { grupoEjemplo, materiaEjemplo, usuarioAdmin, usuarioMaestro } from '../test/fakes';
import { renderApp } from '../test/renderApp';

const sesionAdmin = { token: 't-admin', usuario: usuarioAdmin };

const abrirPestana = async (usuario: ReturnType<typeof userEvent.setup>, nombre: RegExp) =>
  usuario.click(await screen.findByRole('tab', { name: nombre }));

describe('administración: materias', () => {
  it('crea una materia con nombre, descripción y semanas', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/admin', { sesion: sesionAdmin });
    await abrirPestana(usuario, /^Materias$/);

    await usuario.type(screen.getByLabelText('Nombre'), 'Ética');
    await usuario.type(screen.getByLabelText('Descripción (opcional)'), 'Valores');
    await usuario.clear(screen.getByLabelText('Total de semanas'));
    await usuario.type(screen.getByLabelText('Total de semanas'), '18');
    await usuario.click(screen.getByRole('button', { name: /Crear materia/ }));

    expect(await screen.findByText('Materia «Ética» creada.')).toBeInTheDocument();
    expect(repos.materias.creadas[0]).toEqual({ nombre: 'Ética', descripcion: 'Valores', totalSemanas: 18 });
    expect(await screen.findByRole('article', { name: 'Ética' })).toHaveTextContent('18 semanas');
  });

  it('edita una materia existente', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/admin', { sesion: sesionAdmin, preparar: (r) => r.materias.lista.push({ ...materiaEjemplo }) });
    await abrirPestana(usuario, /^Materias$/);

    const tarjeta = await screen.findByRole('article', { name: materiaEjemplo.nombre });
    await usuario.click(within(tarjeta).getByRole('button', { name: /Editar/ }));
    const semanas = within(tarjeta).getByLabelText('Total de semanas');
    await usuario.clear(semanas);
    await usuario.type(semanas, '20');
    await usuario.click(within(tarjeta).getByRole('button', { name: /Guardar cambios/ }));

    expect(await within(tarjeta).findByText('20 semanas')).toBeInTheDocument();
    expect(repos.materias.actualizaciones[0]).toMatchObject({ id: 'm1', cambios: { totalSemanas: 20 } });
  });

  it('al eliminar una materia con grupos muestra el mensaje del servidor (409)', async () => {
    const usuario = userEvent.setup();
    renderApp('/admin', {
      sesion: sesionAdmin,
      preparar: (r) => {
        r.materias.lista.push({ ...materiaEjemplo });
        r.materias.conGrupos.add('m1');
      },
    });
    await abrirPestana(usuario, /^Materias$/);

    const tarjeta = await screen.findByRole('article', { name: materiaEjemplo.nombre });
    await usuario.click(within(tarjeta).getByRole('button', { name: /Eliminar/ }));
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent(/contenido de todas sus semanas/);
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, eliminar' }));
    expect(await within(dialogo).findByRole('alert')).toHaveTextContent('No se puede eliminar la materia porque tiene grupos.');
    expect(screen.getByRole('article', { name: materiaEjemplo.nombre })).toBeInTheDocument();
  });
});

describe('administración: grupos', () => {
  it('crea un grupo eligiendo materia y maestro', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/admin', {
      sesion: sesionAdmin,
      preparar: (r) => {
        r.materias.lista.push({ ...materiaEjemplo });
        r.usuarios.lista.push(usuarioMaestro);
      },
    });
    await abrirPestana(usuario, /Grupos/);

    await usuario.click(screen.getByRole('button', { name: /Crear grupo/ }));
    expect(await screen.findByText('Elige una materia.')).toBeInTheDocument();
    expect(repos.grupos.creados).toHaveLength(0);

    await usuario.selectOptions(await screen.findByLabelText('Materia'), 'm1');
    await usuario.selectOptions(await screen.findByLabelText('Maestro'), 'u2');
    await usuario.type(screen.getByLabelText('Grupo'), '05');
    await usuario.type(screen.getByLabelText('Periodo'), '2026-B');
    await usuario.type(screen.getByLabelText('Aula (opcional)'), '106');
    await usuario.type(screen.getByLabelText('Fecha de inicio'), '2026-08-03');
    await usuario.click(screen.getByRole('button', { name: /Crear grupo/ }));

    expect(await screen.findByText('Grupo 05 creado.')).toBeInTheDocument();
    expect(repos.grupos.creados[0]).toEqual({
      materiaId: 'm1',
      maestroId: 'u2',
      nombre: '05',
      periodo: '2026-B',
      aula: '106',
      fechaInicio: '2026-08-03',
    });
  });

  it('elimina un grupo tras explicar que la materia se conserva', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/admin', { sesion: sesionAdmin, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    await abrirPestana(usuario, /Grupos/);

    const tarjeta = await screen.findByRole('article', { name: /grupo 05/ });
    expect(tarjeta).toHaveTextContent('Grupo 05 | 2026-B | Aula 106 | Maestro: Carlos Ruiz');
    await usuario.click(within(tarjeta).getByRole('button', { name: /Eliminar/ }));
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent(/inscripciones de los alumnos y todas las calificaciones/);
    expect(dialogo).toHaveTextContent(/La materia, su contenido semanal y sus exámenes no se borran/);
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
