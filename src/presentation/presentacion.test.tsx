import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ErrorAplicacion } from '../domain/errors/ErrorAplicacion';
import { boletaMateria, preguntasEjemplo, resumenExamen, sesionAlumno, sesionMaestro, ventanas } from '../test/datos';
import { grupoEjemplo, sembrarPlan, usuarioAlumno } from '../test/fakes';
import { renderApp } from '../test/renderApp';
import { WeekSelector } from './components/dashboard/WeekSelector';

describe('WeekSelector', () => {
  it('muestra cada semana con su rango, estado y enlace', () => {
    render(
      <MemoryRouter>
        <WeekSelector semanas={grupoEjemplo.semanas} rutaSemana={(n) => `/grupos/g1/semanas/${n}`} />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('link')).toHaveLength(4);
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
    expect(await screen.findByRole('heading', { name: 'Prepa intensiva' })).toBeInTheDocument();
    expect(screen.getByText(/Grupo Generación agosto · Inicia/)).toBeInTheDocument();
    expect(screen.getByText('Semana 2 de 4')).toBeInTheDocument();
    expect(screen.getByText('Alumno')).toBeInTheDocument();
  });

  it('el botón ver/ocultar alterna la visibilidad de la contraseña', async () => {
    const usuario = userEvent.setup();
    renderApp('/login');
    const campo = await screen.findByLabelText('Contraseña');
    await usuario.type(campo, 'secreto');
    expect(campo).toHaveAttribute('type', 'password');

    await usuario.click(screen.getByRole('button', { name: 'Ver contraseña' }));
    expect(campo).toHaveAttribute('type', 'text');
    expect(campo).toHaveValue('secreto');

    await usuario.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(campo).toHaveAttribute('type', 'password');
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

  it('un alumno no puede abrir el editor de una materia', async () => {
    renderApp('/materias/m1', { sesion: sesionAlumno });
    expect(await screen.findByRole('heading', { name: /¡Hola/ })).toBeInTheDocument();
  });
});

describe('dashboard del alumno', () => {
  it('muestra su grupo con el calendario, las materias por bloque y su promedio general', async () => {
    renderApp('/', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.grupos.calificaciones.g1 = {
          materias: [],
          boletas: [{ alumno: usuarioAlumno, materias: [boletaMateria('m1', [8, 9])], promedioGeneral: 4.25 }],
        };
      },
    });
    const grupo = await screen.findByRole('article', { name: 'Grupo Generación agosto' });
    expect(await within(grupo).findByLabelText('Promedio general: 4.3 de 10')).toBeInTheDocument();
    expect(within(grupo).getByRole('link', { name: /Ir a la semana actual/ })).toHaveAttribute('href', '/grupos/g1/semanas/2');
    expect(within(grupo).getAllByRole('link', { name: /^Semana \d/ })).toHaveLength(4);
    const bloques = within(grupo).getByRole('list', { name: 'Materias por bloque' });
    expect(within(bloques).getByText('Semanas 1 y 2')).toBeInTheDocument();
    expect(within(bloques).getByText('Matemáticas · Historia')).toBeInTheDocument();
    expect(within(bloques).getByText('Química')).toBeInTheDocument();
    expect(within(grupo).getByRole('link', { name: /Calificaciones/ })).toHaveAttribute('href', '/grupos/g1/calificaciones');
  });

  it('sin grupo lo indica', async () => {
    renderApp('/', { sesion: sesionAlumno });
    expect(await screen.findByText('Aún no estás inscrito en un grupo.')).toBeInTheDocument();
  });
});

describe('dashboard del maestro', () => {
  it('lista sus materias por versión del plan y los grupos que las cursan, sin calendario ni promedio', async () => {
    renderApp('/', {
      sesion: sesionMaestro,
      preparar: (r) => {
        sembrarPlan(r);
        r.grupos.lista.push(grupoEjemplo);
      },
    });
    const plan = await screen.findByRole('region', { name: 'Prepa intensiva · versión 1' });
    expect(within(plan).getByText('Publicado')).toBeInTheDocument();
    expect(within(plan).getByRole('link', { name: /Matemáticas/ })).toHaveAttribute('href', '/materias/m1');
    expect(within(plan).getByRole('link', { name: /Química/ })).toHaveAttribute('href', '/materias/m3');
    expect(within(plan).queryByText('Historia')).not.toBeInTheDocument();

    const grupo = await screen.findByRole('article', { name: 'Grupo Generación agosto' });
    expect(within(grupo).queryByRole('link', { name: /^Semana \d/ })).not.toBeInTheDocument();
    expect(within(grupo).queryByLabelText(/Promedio general/)).not.toBeInTheDocument();
    expect(within(grupo).getByRole('link', { name: /Calificaciones/ })).toBeInTheDocument();
  });
});

describe('layout', () => {
  it('en la semana el header muestra el plan del grupo y ningún botón volver', async () => {
    renderApp('/grupos/g1/semanas/2', { sesion: sesionAlumno, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    const header = await screen.findByRole('banner');
    expect(await within(header).findByText('Prepa intensiva')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Volver/ })).not.toBeInTheDocument();
  });

  it('en el examen no hay botón volver', async () => {
    renderApp('/grupos/g1/examenes/e1', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.examenesGrupo.lista.push({ grupoId: 'g1', resumen: resumenExamen(), preguntas: preguntasEjemplo });
      },
    });
    expect(await screen.findByRole('heading', { name: 'Semana 2 · Examen 1' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Volver/ })).not.toBeInTheDocument();
  });

  it('fuera de un grupo el header no muestra el plan', async () => {
    renderApp('/', { sesion: sesionAlumno, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    const header = await screen.findByRole('banner');
    expect(await screen.findByRole('heading', { name: 'Prepa intensiva' })).toBeInTheDocument();
    expect(within(header).queryByText('Prepa intensiva')).not.toBeInTheDocument();
  });

  it('al cambiar de pantalla la página empieza desde arriba', async () => {
    const usuario = userEvent.setup();
    renderApp('/grupos/g1/semanas/2', { sesion: sesionAlumno, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    const header = await screen.findByRole('banner');
    vi.mocked(window.scrollTo).mockClear();
    await usuario.click(await within(header).findByRole('link', { name: /CES Ipalnemohuani/ }));
    expect(await screen.findByRole('heading', { name: /¡Hola/ })).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it('el menú lateral y su botón de hamburguesa están apagados', async () => {
    renderApp('/', { sesion: sesionAlumno });
    const header = await screen.findByRole('banner');
    expect(document.getElementById('menu-lateral')).not.toBeInTheDocument();
    expect(within(header).queryByRole('button', { name: /menú/ })).not.toBeInTheDocument();
  });

  it('el logo va hasta la izquierda del header y lleva al inicio', async () => {
    const usuario = userEvent.setup();
    renderApp('/grupos/g1/semanas/2', { sesion: sesionAlumno, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    const header = await screen.findByRole('banner');

    const logo = within(header).getByRole('link', { name: /CES Ipalnemohuani/ });
    expect(logo).toHaveAttribute('href', '/');
    // Es lo primero del header, antes del menú del usuario.
    expect(within(header).getAllByRole('link')[0]).toBe(logo);
    await usuario.click(logo);
    expect(await screen.findByRole('heading', { name: /¡Hola/ })).toBeInTheDocument();
  });

  it('cerrar sesión está en el menú desplegable del nombre del usuario', async () => {
    const usuario = userEvent.setup();
    renderApp('/', { sesion: sesionAlumno });
    const header = await screen.findByRole('banner');
    expect(screen.queryByRole('menuitem', { name: 'Cerrar sesión' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument();

    const botonUsuario = within(header).getByRole('button', { name: /opciones de la cuenta/ });
    await usuario.click(botonUsuario);
    expect(botonUsuario).toHaveAttribute('aria-expanded', 'true');

    await usuario.keyboard('{Escape}');
    expect(screen.queryByRole('menuitem', { name: 'Cerrar sesión' })).not.toBeInTheDocument();

    await usuario.click(botonUsuario);
    await usuario.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
  });
});

describe('semana del alumno', () => {
  const contenido = {
    id: 'c1',
    materiaId: 'm1',
    semana: 2,
    tema: 'Ecuaciones',
    introduccion: 'Esta semana resolvemos ecuaciones.',
    recursos: [
      { tipo: 'youtube' as const, titulo: 'Video introductorio', url: 'https://youtu.be/dQw4w9WgXcQ' },
      { tipo: 'pdf' as const, titulo: 'Lectura obligatoria', url: 'https://escuela.mx/lectura.pdf' },
    ],
    links: { grabacion: 'https://drive.google.com/file/d/rec/view' },
  };

  it('muestra las materias del bloque y, de la elegida, su semana con los exámenes 1 y 2 según su ventana', async () => {
    const usuario = userEvent.setup();
    renderApp('/grupos/g1/semanas/2', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.contenido.lista.push(contenido);
        r.examenesGrupo.lista.push(
          { grupoId: 'g1', resumen: resumenExamen(), preguntas: preguntasEjemplo },
          { grupoId: 'g1', resumen: resumenExamen({ id: 'e2', numero: 2, ventana: ventanas.proxima }), preguntas: preguntasEjemplo },
        );
      },
    });

    expect(await screen.findByRole('heading', { name: /Semana 2\s*de 4/ })).toBeInTheDocument();
    const materias = screen.getByRole('navigation', { name: 'Materias de la semana' });
    expect(within(materias).getByRole('link', { name: 'Matemáticas' })).toHaveAttribute('aria-current', 'page');
    expect(within(materias).getByRole('link', { name: 'Historia' })).toHaveAttribute('href', '/grupos/g1/semanas/2?materia=m2');

    expect(await screen.findByRole('heading', { name: 'Ecuaciones' })).toBeInTheDocument();
    expect(screen.getByText('Semana 2 de Matemáticas · Carlos Ruiz')).toBeInTheDocument();
    expect(screen.getByTitle('Video introductorio')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(screen.getByRole('link', { name: /Ver clase grabada/ })).toHaveAttribute('href', contenido.links.grabacion);

    const examen1 = await screen.findByRole('link', { name: /Hacer examen 1/ });
    expect(examen1).toHaveAttribute('href', '/grupos/g1/examenes/e1');
    expect(examen1).toHaveAccessibleDescription(/^Disponible hasta el/);
    const examen2 = screen.getByRole('button', { name: /Hacer examen 2/ });
    expect(examen2).toBeDisabled();
    expect(examen2).toHaveAccessibleDescription(/^Abre el 2 de marzo de 2099/);

    await usuario.click(within(materias).getByRole('link', { name: 'Historia' }));
    expect(await screen.findByText('Semana 2 de Historia')).toBeInTheDocument();
    expect(await screen.findByText('Esta semana aún no tiene contenido')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Examen no disponible/ })).toHaveLength(2);
  });

  it('en las semanas 3 y 4 se cursa la materia del bloque 2', async () => {
    renderApp('/grupos/g1/semanas/3', { sesion: sesionAlumno, preparar: (r) => r.grupos.lista.push(grupoEjemplo) });
    expect(await screen.findByText('Semana 1 de Química · Carlos Ruiz')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Materias de la semana' })).not.toBeInTheDocument();
  });

  it('si ya respondió muestra la calificación sobre 10 y lleva a la revisión', async () => {
    renderApp('/grupos/g1/semanas/2', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.grupos.lista.push(grupoEjemplo);
        r.examenesGrupo.lista.push({
          grupoId: 'g1',
          resumen: resumenExamen({ miIntento: { aciertos: 1, totalPreguntas: 2, calificacion: 5, fecha: '' } }),
          preguntas: preguntasEjemplo,
        });
      },
    });
    expect(await screen.findByRole('link', { name: /Examen 1 · Calificación: 5 \/ 10/ })).toHaveAttribute(
      'href',
      '/grupos/g1/examenes/e1',
    );
  });

  it('un grupo inexistente muestra un aviso', async () => {
    renderApp('/grupos/nada/semanas/1', { sesion: sesionAlumno });
    expect(await screen.findByText('No encontramos este grupo.')).toBeInTheDocument();
  });
});

describe('materia del maestro', () => {
  it('en un plan publicado solo ofrece corregir lo que existe y no deja importar', async () => {
    renderApp('/materias/m1', {
      sesion: sesionMaestro,
      preparar: (r) => {
        sembrarPlan(r);
        r.contenido.lista.push({ id: 'c1', materiaId: 'm1', semana: 1, tema: 'Fracciones', recursos: [] });
        r.examenes.lista.push({ id: 'e1', materiaId: 'm1', semana: 1, numero: 1, titulo: 'Repaso', diasExtra: 0, preguntas: preguntasEjemplo });
      },
    });
    expect(await screen.findByRole('heading', { name: 'Matemáticas' })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/ya está publicado/);

    const semana1 = await screen.findByRole('region', { name: 'Semana 1' });
    expect(await within(semana1).findByText('Fracciones')).toBeInTheDocument();
    expect(within(semana1).getByRole('link', { name: /Editar contenido/ })).toHaveAttribute('href', '/materias/m1/semanas/1/contenido');
    expect(within(semana1).getByRole('link', { name: /Editar examen 1/ })).toHaveAttribute('href', '/materias/m1/examenes/e1/editar');
    expect(within(semana1).queryByRole('link', { name: /Crear/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Importar exámenes/ })).not.toBeInTheDocument();
  });

  it('en borrador ofrece crear contenido y exámenes, e importar desde la plantilla', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/materias/m1', {
      sesion: sesionMaestro,
      preparar: (r) => {
        sembrarPlan(r, { estado: 'borrador' });
        r.examenes.errorAlImportar = new ErrorAplicacion(['La hoja tiene 1 error; no se importó nada', 'Fila 3: la semana debe ser 1 o 2'], 400);
      },
    });
    const semana2 = await screen.findByRole('region', { name: 'Semana 2' });
    expect(await within(semana2).findByRole('link', { name: /Crear contenido/ })).toHaveAttribute('href', '/materias/m1/semanas/2/contenido');
    expect(within(semana2).getByRole('link', { name: 'Crear Semana 2 · Examen 2' })).toHaveAttribute(
      'href',
      '/materias/m1/examenes/nuevo?semana=2&numero=2',
    );

    expect(screen.getByRole('link', { name: 'plantilla de ejemplo' })).toHaveAttribute('href', '/plantilla-examenes.csv');
    const importar = screen.getByRole('button', { name: /Importar/ });
    expect(importar).toBeDisabled();
    await usuario.upload(screen.getByLabelText('Archivo CSV'), new File(['semana,examen\n3,1'], 'examenes.csv', { type: 'text/csv' }));
    await usuario.click(importar);
    expect(await screen.findByText('Fila 3: la semana debe ser 1 o 2')).toBeInTheDocument();
    expect(repos.examenes.importaciones).toEqual([{ materiaId: 'm1', csv: 'semana,examen\n3,1' }]);
  });
});

describe('editor de contenido', () => {
  it('valida URLs, crea el contenido de la semana de la materia y vuelve a la materia', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/materias/m1/semanas/1/contenido', {
      sesion: sesionMaestro,
      preparar: (r) => sembrarPlan(r, { estado: 'borrador' }),
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

    const semana1 = await screen.findByRole('region', { name: 'Semana 1' });
    expect(await within(semana1).findByText('Introducción')).toBeInTheDocument();
    expect(repos.contenido.creados[0]).toMatchObject({
      materiaId: 'm1',
      semana: 1,
      tema: 'Introducción',
      recursos: [{ tipo: 'web', titulo: 'Lectura', url: 'https://escuela.mx/l.pdf' }],
      links: { grabacion: 'https://drive.google.com/grabacion' },
    });
  });

  it('en un plan publicado corrige pero no ofrece eliminar', async () => {
    renderApp('/materias/m1/semanas/2/contenido', {
      sesion: sesionMaestro,
      preparar: (r) => {
        sembrarPlan(r);
        r.contenido.lista.push({ id: 'c1', materiaId: 'm1', semana: 2, tema: 'Tema', recursos: [] });
      },
    });
    expect(await screen.findByLabelText('Tema')).toHaveValue('Tema');
    expect(screen.queryByRole('button', { name: /Eliminar contenido/ })).not.toBeInTheDocument();
  });

  it('en borrador elimina el contenido después de confirmar', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/materias/m1/semanas/2/contenido', {
      sesion: sesionMaestro,
      preparar: (r) => {
        sembrarPlan(r, { estado: 'borrador' });
        r.contenido.lista.push({ id: 'c1', materiaId: 'm1', semana: 2, tema: 'Tema', recursos: [] });
      },
    });
    await usuario.click(await screen.findByRole('button', { name: /Eliminar contenido/ }));
    const dialogo = screen.getByRole('dialog', { name: '¿Eliminar el contenido de esta semana?' });
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, eliminar' }));
    expect(await screen.findByRole('region', { name: 'Semana 2' })).toBeInTheDocument();
    expect(repos.contenido.eliminados).toEqual(['c1']);
  });
});

describe('editor de examen', () => {
  const llenarPregunta = async (usuario: ReturnType<typeof userEvent.setup>) => {
    await usuario.type(screen.getByLabelText('Enunciado'), '¿2 + 2?');
    await usuario.type(screen.getByLabelText('Opción 1 de la pregunta 1'), '3');
    await usuario.type(screen.getByLabelText('Opción 2 de la pregunta 1'), '4');
    await usuario.click(screen.getByLabelText('Marcar opción 2 como correcta'));
  };

  it('crea el examen 2 de la semana 1 con sus días extra', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/materias/m1/examenes/nuevo?semana=1&numero=2', {
      sesion: sesionMaestro,
      preparar: (r) => sembrarPlan(r, { estado: 'borrador' }),
    });

    expect(await screen.findByLabelText('Semana de la materia')).toHaveValue('1');
    expect(screen.getByLabelText('Examen')).toHaveValue('2');
    expect(screen.getByLabelText('Título')).toHaveValue('Semana 1 · Examen 2');
    expect(screen.getByText(/Abre el jueves/)).toBeInTheDocument();
    await usuario.clear(screen.getByLabelText('Días extra'));
    await usuario.type(screen.getByLabelText('Días extra'), '3');
    await llenarPregunta(usuario);
    await usuario.click(screen.getByRole('button', { name: /Crear examen/ }));

    expect(await screen.findByText('Examen creado correctamente.')).toBeInTheDocument();
    expect(repos.examenes.creados[0]).toMatchObject({ materiaId: 'm1', semana: 1, numero: 2, diasExtra: 3 });
    expect(screen.getByRole('heading', { name: 'Editar examen' })).toBeInTheDocument();

    // Al guardar cambios, la confirmación aparece junto al botón (dentro del formulario).
    await usuario.type(screen.getByLabelText('Título'), ' (repaso)');
    const guardar = screen.getByRole('button', { name: /Guardar cambios/ });
    await usuario.click(guardar);
    const aviso = await screen.findByRole('status');
    expect(aviso).toHaveTextContent('Examen guardado correctamente.');
    expect(guardar.closest('form')).toContainElement(aviso);
  });

  it('valida los días extra (0 a 30)', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/materias/m1/examenes/nuevo?semana=1&numero=1', {
      sesion: sesionMaestro,
      preparar: (r) => sembrarPlan(r, { estado: 'borrador' }),
    });
    await usuario.clear(await screen.findByLabelText('Días extra'));
    await usuario.type(screen.getByLabelText('Días extra'), '45');
    await llenarPregunta(usuario);
    await usuario.click(screen.getByRole('button', { name: /Crear examen/ }));
    expect(await screen.findByText('Máximo 30 días.')).toBeInTheDocument();
    expect(repos.examenes.creados).toHaveLength(0);
  });

  it('con respuestas registradas solo deja corregir la redacción', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/materias/m1/examenes/e1/editar', {
      sesion: sesionMaestro,
      preparar: (r) => {
        sembrarPlan(r);
        r.examenes.lista.push({
          id: 'e1',
          materiaId: 'm1',
          semana: 1,
          numero: 1,
          titulo: 'Repaso',
          diasExtra: 0,
          preguntas: preguntasEjemplo,
          tieneRespuestas: true,
        });
      },
    });
    expect(await screen.findByText(/ya tiene respuestas de alumnos/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Añadir pregunta/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar pregunta 1' })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: /Añadir opción/ })[0]).toBeDisabled();
    expect(screen.getAllByLabelText(/Marcar opción 1 como correcta/)[0]).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Eliminar examen/ })).not.toBeInTheDocument();

    const enunciado = screen.getAllByLabelText('Enunciado')[0]!;
    await usuario.clear(enunciado);
    await usuario.type(enunciado, '¿Cuánto es 2 más 2?');
    await usuario.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    expect(await screen.findByText('Examen guardado correctamente.')).toBeInTheDocument();
    expect(repos.examenes.actualizaciones[0]?.cambios.preguntas?.[0]).toEqual({
      enunciado: '¿Cuánto es 2 más 2?',
      opciones: ['3', '4'],
      respuestaCorrecta: 1,
    });
  });
});
