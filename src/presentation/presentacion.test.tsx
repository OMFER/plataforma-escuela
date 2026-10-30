import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ErrorAplicacion } from '../domain/errors/ErrorAplicacion';
import { grupoEjemplo, usuarioAlumno } from '../test/fakes';
import { preguntasEjemplo, resumenExamen, sesionAlumno, sesionMaestro, ventanas } from '../test/datos';
import { renderApp } from '../test/renderApp';
import { WeekSelector } from './components/dashboard/WeekSelector';

describe('WeekSelector', () => {
  it('muestra cada semana con su rango, estado y enlace', () => {
    render(
      <MemoryRouter>
        <WeekSelector semanas={grupoEjemplo.semanas} rutaSemana={(n) => `/grupos/g1/semanas/${n}`} />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Semana 1, 3–9 ago, completada' })).toHaveAttribute('href', '/grupos/g1/semanas/1');
    expect(screen.getByRole('link', { name: /Semana 2, 10–16 ago, semana actual/ })).toHaveAttribute('aria-current', 'date');
    // Las semanas futuras también se pueden abrir.
    expect(screen.getByRole('link', { name: /Semana 3, 17–23 ago, próxima/ })).toHaveAttribute('href', '/grupos/g1/semanas/3');
  });
});

describe('autenticación y rutas', () => {
  it('sin sesión redirige al login', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
  });

  it('muestra el error del backend y luego entra al dashboard con sus grupos', async () => {
    const usuario = userEvent.setup();
    renderApp('/login', {
      preparar: (r) => {
        r.auth.usuarios['ana@escuela.mx'] = { password: 'secreto', usuario: usuarioAlumno };
        r.grupos.lista.push(grupoEjemplo);
      },
    });

    await usuario.type(screen.getByLabelText('Correo'), 'ana@escuela.mx');
    await usuario.type(screen.getByLabelText('Contraseña'), 'incorrecta');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();

    await usuario.clear(screen.getByLabelText('Contraseña'));
    await usuario.type(screen.getByLabelText('Contraseña'), 'secreto');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('heading', { name: '¡Hola, Ana López!' })).toBeInTheDocument();
    expect(await screen.findByText('Creatividad e innovación tecnológica')).toBeInTheDocument();
    expect(screen.getByText('Grupo 05 | 2026-B | Aula 106')).toBeInTheDocument();
    expect(screen.getByText('Semana 2 de 3')).toBeInTheDocument();
    expect(screen.getByText('Alumno')).toBeInTheDocument();
  });

  it('un 401 de la API cierra la sesión y vuelve al login', async () => {
    const { dependencias } = renderApp('/', { sesion: sesionAlumno });
    expect(await screen.findByRole('heading', { name: /¡Hola/ })).toBeInTheDocument();
    act(() => dependencias.expirarSesion());
    expect(await screen.findByText('Tu sesión expiró. Vuelve a iniciar sesión.')).toBeInTheDocument();
  });

  it('un alumno no puede entrar a /admin ni a los editores', async () => {
    renderApp('/admin', { sesion: sesionAlumno });
    expect(await screen.findByRole('heading', { name: /¡Hola/ })).toBeInTheDocument();
  });
});

describe('dashboard', () => {
  it('el alumno ve el estado del examen final y el acceso a calificaciones', async () => {
    renderApp('/', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.examenesGrupo.lista.push({
          grupoId: 'g1',
          resumen: resumenExamen({ id: 'ef', tipo: 'Final', semana: undefined, ventana: ventanas.proxima }),
          preguntas: preguntasEjemplo,
        });
      },
    });
    const final = await screen.findByRole('button', { name: /Hacer examen final/ });
    expect(final).toBeDisabled();
    expect(final).toHaveAccessibleDescription(/^Abre el 2 de marzo de 2099/);
    expect(screen.getByRole('link', { name: /Calificaciones/ })).toHaveAttribute('href', '/grupos/g1/calificaciones');
    expect(screen.getByRole('link', { name: /Ir a la semana actual/ })).toHaveAttribute('href', '/grupos/g1/semanas/2');
  });

  it('si ya respondió el final muestra su calificación y lleva a la revisión', async () => {
    renderApp('/', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.examenesGrupo.lista.push({
          grupoId: 'g1',
          resumen: resumenExamen({
            id: 'ef',
            tipo: 'Final',
            semana: undefined,
            ventana: ventanas.cerrada,
            miIntento: { aciertos: 1, totalPreguntas: 2, calificacion: 8, fecha: '' },
          }),
          preguntas: preguntasEjemplo,
        });
      },
    });
    expect(await screen.findByRole('link', { name: /Examen final · Calificación: 8 \/ 10/ })).toHaveAttribute(
      'href',
      '/grupos/g1/examenes/ef',
    );
  });

  it('sin examen final el alumno lo ve deshabilitado y el maestro puede crearlo', async () => {
    renderApp('/', { sesion: sesionAlumno, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    expect(await screen.findByRole('button', { name: /Sin examen final/ })).toBeDisabled();
  });

  it('el maestro ve el enlace para crear el examen final', async () => {
    renderApp('/', { sesion: sesionMaestro, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    expect(await screen.findByRole('link', { name: /Crear examen final/ })).toHaveAttribute(
      'href',
      '/grupos/g1/examenes/nuevo?tipo=Final',
    );
  });
});

describe('semana', () => {
  const contenido = {
    id: 'c1',
    materiaId: 'm1',
    semana: 2,
    tema: 'Pensamiento de diseño',
    introduccion: 'Esta semana exploramos el design thinking.',
    recursos: [
      { tipo: 'youtube' as const, titulo: 'Video introductorio', url: 'https://youtu.be/dQw4w9WgXcQ' },
      { tipo: 'pdf' as const, titulo: 'Lectura obligatoria', url: 'https://escuela.mx/lectura.pdf' },
      { tipo: 'youtube' as const, titulo: 'Video roto', url: 'https://youtube.com/channel/x' },
    ],
    links: {},
  };

  it('muestra el contenido de la materia del grupo y los botones de examen y reposición según su ventana', async () => {
    renderApp('/grupos/g1/semanas/2', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.contenido.lista.push(contenido);
        r.examenesGrupo.lista.push(
          { grupoId: 'g1', resumen: resumenExamen(), preguntas: preguntasEjemplo },
          {
            grupoId: 'g1',
            resumen: resumenExamen({ id: 'e2', tipo: 'Reposicion', ventana: ventanas.proxima }),
            preguntas: preguntasEjemplo,
          },
        );
      },
    });

    expect(await screen.findByRole('heading', { name: 'Pensamiento de diseño' })).toBeInTheDocument();
    expect(screen.getByText(/Grupo 05 · 2026-B/)).toBeInTheDocument();
    expect(screen.getByTitle('Video introductorio')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    const pdf = screen.getByRole('link', { name: /Lectura obligatoria/ });
    expect(pdf).toHaveAttribute('target', '_blank');
    expect(pdf).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('link', { name: /Video roto/ })).toHaveAttribute('href', 'https://youtube.com/channel/x');

    expect(screen.getByRole('button', { name: /Ver clase grabada/ })).toBeDisabled();
    const examen = await screen.findByRole('link', { name: /Hacer examen/ });
    expect(examen).toHaveAttribute('href', '/grupos/g1/examenes/e1');
    expect(examen).toHaveAccessibleDescription(/^Disponible hasta el/);
    const reposicion = screen.getByRole('button', { name: /Reposición/ });
    expect(reposicion).toBeDisabled();
    expect(reposicion).toHaveAccessibleDescription(/^Abre el 2 de marzo de 2099/);
  });

  it('un examen cerrado sin responder aparece deshabilitado como "Cerrado"', async () => {
    renderApp('/grupos/g1/semanas/2', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.examenesGrupo.lista.push({ grupoId: 'g1', resumen: resumenExamen({ ventana: ventanas.cerrada }), preguntas: preguntasEjemplo });
      },
    });
    const boton = await screen.findByRole('button', { name: /Hacer examen/ });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAccessibleDescription('Cerrado');
  });

  it('sin contenido ni exámenes muestra los mensajes correspondientes', async () => {
    renderApp('/grupos/g1/semanas/3', { sesion: sesionAlumno, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    expect(await screen.findByText('El maestro aún no publica el contenido de esta semana')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Sin examen esta semana/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Sin reposición esta semana/ })).toBeDisabled();
  });

  it('si ya respondió muestra la calificación y lleva a la revisión', async () => {
    renderApp('/grupos/g1/semanas/2', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.examenesGrupo.lista.push({
          grupoId: 'g1',
          resumen: resumenExamen({ miIntento: { aciertos: 2, totalPreguntas: 2, calificacion: 10, fecha: '2026-08-12T00:00:00Z' } }),
          preguntas: preguntasEjemplo,
          respuestas: [1, 0],
        });
      },
    });
    const enlace = await screen.findByRole('link', { name: /Examen semanal · Calificación: 10 \/ 10/ });
    expect(enlace).toHaveAttribute('href', '/grupos/g1/examenes/e1');
    expect(screen.queryByRole('link', { name: /^Hacer examen$/ })).not.toBeInTheDocument();
  });

  it('un grupo inexistente muestra un aviso', async () => {
    renderApp('/grupos/nada/semanas/1', { sesion: sesionAlumno });
    expect(await screen.findByText('No encontramos este grupo.')).toBeInTheDocument();
  });

  it('el maestro ve crear contenido, examen semanal y la reposición bloqueada hasta tener el semanal', async () => {
    renderApp('/grupos/g1/semanas/1', { sesion: sesionMaestro, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    expect(await screen.findByRole('link', { name: /Crear contenido/ })).toHaveAttribute('href', '/grupos/g1/semanas/1/contenido');
    expect(await screen.findByRole('link', { name: /Crear examen semanal/ })).toHaveAttribute(
      'href',
      '/grupos/g1/examenes/nuevo?tipo=Semanal&semana=1',
    );
    expect(screen.getByRole('button', { name: /Crear reposición/ })).toBeDisabled();
    expect(screen.getByText('Primero crea el examen semanal.')).toBeInTheDocument();
  });

  it('con examen semanal el maestro puede editarlo y crear la reposición', async () => {
    renderApp('/grupos/g1/semanas/2', {
      sesion: sesionMaestro,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.examenesGrupo.lista.push({ grupoId: 'g1', resumen: resumenExamen(), preguntas: preguntasEjemplo });
      },
    });
    expect(await screen.findByRole('link', { name: /Editar examen semanal/ })).toHaveAttribute('href', '/grupos/g1/examenes/e1/editar');
    expect(screen.getByRole('link', { name: /Crear reposición/ })).toHaveAttribute(
      'href',
      '/grupos/g1/examenes/nuevo?tipo=Reposicion&semana=2',
    );
  });
});

describe('editor de contenido (maestro)', () => {
  it('valida URLs y crea el contenido de la semana en la materia del grupo', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/grupos/g1/semanas/1/contenido', {
      sesion: sesionMaestro,
      preparar: (r) => r.grupos.lista.push(grupoEjemplo),
    });

    await usuario.type(await screen.findByLabelText('Tema'), 'Introducción');
    await usuario.click(screen.getByRole('button', { name: /Añadir recurso/ }));
    await usuario.type(screen.getByLabelText('Título'), 'Lectura');
    await usuario.type(screen.getByLabelText('URL'), 'no-es-url');
    await usuario.click(screen.getByRole('button', { name: /Guardar contenido/ }));
    expect(await screen.findByText(/Escribe una URL válida/)).toBeInTheDocument();
    expect(repos.contenido.creados).toHaveLength(0);

    await usuario.clear(screen.getByLabelText('URL'));
    await usuario.type(screen.getByLabelText('URL'), 'https://escuela.mx/l.pdf');
    await usuario.type(screen.getByLabelText('Link de la clase grabada'), 'https://drive.google.com/grabacion');
    await usuario.click(screen.getByRole('button', { name: /Guardar contenido/ }));

    expect(await screen.findByRole('heading', { name: 'Introducción' })).toBeInTheDocument();
    expect(repos.contenido.creados[0]).toMatchObject({
      materiaId: 'm1',
      semana: 1,
      tema: 'Introducción',
      recursos: [{ tipo: 'web', titulo: 'Lectura', url: 'https://escuela.mx/l.pdf' }],
      links: { grabacion: 'https://drive.google.com/grabacion' },
    });
  });

  it('elimina el contenido después de confirmar', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/grupos/g1/semanas/2/contenido', {
      sesion: sesionMaestro,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.contenido.lista.push({ id: 'c1', materiaId: 'm1', semana: 2, tema: 'Tema', recursos: [] });
      },
    });
    await usuario.click(await screen.findByRole('button', { name: /Eliminar contenido/ }));
    const dialogo = screen.getByRole('dialog', { name: '¿Eliminar el contenido de esta semana?' });
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, eliminar' }));
    expect(await screen.findByText('El maestro aún no publica el contenido de esta semana')).toBeInTheDocument();
    expect(repos.contenido.eliminados).toEqual(['c1']);
  });
});

describe('editor de examen (maestro)', () => {
  const llenarPregunta = async (usuario: ReturnType<typeof userEvent.setup>) => {
    await usuario.type(screen.getByLabelText('Enunciado'), '¿2 + 2?');
    await usuario.type(screen.getByLabelText('Opción 1 de la pregunta 1'), '3');
    await usuario.type(screen.getByLabelText('Opción 2 de la pregunta 1'), '4');
    await usuario.click(screen.getByLabelText('Marcar opción 2 como correcta'));
  };

  it('crea un examen final: oculta la semana y envía los días extra', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/grupos/g1/examenes/nuevo?tipo=Semanal&semana=2', {
      sesion: sesionMaestro,
      preparar: (r) => r.grupos.lista.push(grupoEjemplo),
    });

    expect(await screen.findByLabelText('Semana')).toHaveValue('2');
    await usuario.selectOptions(screen.getByLabelText('Tipo de examen'), 'Final');
    expect(screen.queryByLabelText('Semana')).not.toBeInTheDocument();
    expect(screen.getByText(/Abre al terminar el semestre/)).toBeInTheDocument();

    await usuario.clear(screen.getByLabelText('Título'));
    await usuario.type(screen.getByLabelText('Título'), 'Examen final');
    await usuario.clear(screen.getByLabelText('Días extra'));
    await usuario.type(screen.getByLabelText('Días extra'), '3');
    await llenarPregunta(usuario);
    await usuario.click(screen.getByRole('button', { name: /Crear examen/ }));

    expect(await screen.findByText('Examen creado correctamente.')).toBeInTheDocument();
    expect(repos.examenes.creados[0]).toMatchObject({ materiaId: 'm1', tipo: 'Final', titulo: 'Examen final', diasExtra: 3 });
    expect(repos.examenes.creados[0]).not.toHaveProperty('semana');
    expect(screen.getByRole('heading', { name: 'Editar examen final' })).toBeInTheDocument();
  });

  it('valida los días extra (0 a 30)', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/grupos/g1/examenes/nuevo?tipo=Semanal&semana=1', {
      sesion: sesionMaestro,
      preparar: (r) => r.grupos.lista.push(grupoEjemplo),
    });
    await usuario.clear(await screen.findByLabelText('Días extra'));
    await usuario.type(screen.getByLabelText('Días extra'), '45');
    await llenarPregunta(usuario);
    await usuario.click(screen.getByRole('button', { name: /Crear examen/ }));
    expect(await screen.findByText('Máximo 30 días.')).toBeInTheDocument();
    expect(repos.examenes.creados).toHaveLength(0);
  });

  it('al editar muestra los resultados del grupo y el 409 al intentar eliminar', async () => {
    const usuario = userEvent.setup();
    renderApp('/grupos/g1/examenes/e1/editar', {
      sesion: sesionMaestro,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.examenes.lista.push({
          id: 'e1',
          materiaId: 'm1',
          tipo: 'Semanal',
          semana: 2,
          titulo: 'Quiz semana 2',
          puntajeMaximo: 10,
          diasExtra: 2,
          preguntas: preguntasEjemplo,
        });
        r.examenesGrupo.lista.push({ grupoId: 'g1', resumen: resumenExamen(), preguntas: preguntasEjemplo });
        r.examenesGrupo.intentos.push({
          id: 'i1',
          examenId: 'e1',
          alumno: { id: 'u1', nombre: 'Ana López', correo: 'ana@escuela.mx' },
          respuestas: [1, 0],
          aciertos: 2,
          totalPreguntas: 2,
          calificacion: 10,
          fecha: '2026-08-12T15:00:00.000Z',
        });
        r.examenes.errorAlEliminar = new ErrorAplicacion('No se puede eliminar un examen semanal que tiene reposición.', 409);
      },
    });

    expect(await screen.findByRole('heading', { name: 'Editar examen semanal' })).toBeInTheDocument();
    expect(await screen.findByText(/Semanal · Semana 2/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Tipo de examen')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Días extra')).toHaveValue(2);
    expect(await screen.findByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText(/ya tiene respuestas de alumnos/)).toBeInTheDocument();
    expect(screen.getByText(/En este grupo: Disponible hasta el/)).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /Eliminar examen/ }));
    const dialogo = screen.getByRole('dialog', { name: '¿Eliminar este examen?' });
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, eliminar' }));
    expect(await within(dialogo).findByRole('alert')).toHaveTextContent('No se puede eliminar un examen semanal que tiene reposición.');
  });
});
