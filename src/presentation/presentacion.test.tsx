import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Examen } from '../domain/entities/Examen';
import { materiaEjemplo, usuarioAlumno, usuarioMaestro } from '../test/fakes';
import { renderApp } from '../test/renderApp';
import { WeekSelector } from './components/dashboard/WeekSelector';

const sesionAlumno = { token: 't-alumno', usuario: usuarioAlumno };
const sesionMaestro = { token: 't-maestro', usuario: usuarioMaestro };

const examenSemana2: Examen = {
  id: 'e1',
  materiaId: 'm1',
  semana: 2,
  titulo: 'Quiz semana 2',
  tipo: 'Semanal',
  puntajeMaximo: 10,
  fechaLimite: '2099-01-01T00:00:00.000Z',
  preguntas: [
    { id: 'p1', enunciado: '¿Cuánto es 2 + 2?', opciones: ['3', '4'], respuestaCorrecta: 1 },
    { id: 'p2', enunciado: '¿Color del cielo?', opciones: ['Azul', 'Verde', 'Rojo'], respuestaCorrecta: 0 },
  ],
  miIntento: null,
};

describe('WeekSelector', () => {
  it('muestra cada semana con su rango, estado y enlace', () => {
    render(
      <MemoryRouter>
        <WeekSelector semanas={materiaEjemplo.semanas} rutaSemana={(n) => `/materias/m1/semanas/${n}`} />
      </MemoryRouter>,
    );
    const enlaces = screen.getAllByRole('link');
    expect(enlaces).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Semana 1, 3–9 ago, completada' })).toHaveAttribute('href', '/materias/m1/semanas/1');
    expect(screen.getByRole('link', { name: /Semana 2, 10–16 ago, semana actual/ })).toHaveAttribute('aria-current', 'date');
    // Las semanas futuras también se pueden abrir.
    expect(screen.getByRole('link', { name: /Semana 3, 17–23 ago, próxima/ })).toHaveAttribute('href', '/materias/m1/semanas/3');
  });
});

describe('autenticación y rutas', () => {
  it('sin sesión redirige al login', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
  });

  it('muestra el error del backend y luego entra al dashboard', async () => {
    const usuario = userEvent.setup();
    renderApp('/login', {
      preparar: (r) => {
        r.auth.usuarios['ana@escuela.mx'] = { password: 'secreto', usuario: usuarioAlumno };
        r.materias.lista.push(materiaEjemplo);
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
    expect(screen.getByText('Semana 2 de 3')).toBeInTheDocument();
    expect(screen.getByText('Alumno')).toBeInTheDocument();
  });

  it('un 401 de la API cierra la sesión y vuelve al login', async () => {
    const { dependencias } = renderApp('/', { sesion: sesionAlumno });
    expect(await screen.findByRole('heading', { name: /¡Hola/ })).toBeInTheDocument();
    act(() => dependencias.expirarSesion());
    expect(await screen.findByText('Tu sesión expiró. Vuelve a iniciar sesión.')).toBeInTheDocument();
  });

  it('un alumno no puede entrar a /admin', async () => {
    renderApp('/admin', { sesion: sesionAlumno });
    expect(await screen.findByRole('heading', { name: /¡Hola/ })).toBeInTheDocument();
  });
});

describe('infografía de la semana', () => {
  it('muestra tema, recursos en orden y el botón de examen', async () => {
    renderApp('/materias/m1/semanas/2', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.materias.lista.push(materiaEjemplo);
        r.contenido.lista.push({
          id: 'c1',
          materiaId: 'm1',
          semana: 2,
          tema: 'Pensamiento de diseño',
          introduccion: 'Esta semana exploramos el design thinking.',
          recursos: [
            { tipo: 'youtube', titulo: 'Video introductorio', url: 'https://youtu.be/dQw4w9WgXcQ' },
            { tipo: 'pdf', titulo: 'Lectura obligatoria', url: 'https://escuela.mx/lectura.pdf' },
            { tipo: 'youtube', titulo: 'Video roto', url: 'https://youtube.com/channel/x' },
          ],
          links: {},
        });
        r.examenes.lista.push({ ...examenSemana2 });
      },
    });

    expect(await screen.findByRole('heading', { name: 'Pensamiento de diseño' })).toBeInTheDocument();
    expect(screen.getByTitle('Video introductorio')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    const pdf = screen.getByRole('link', { name: /Lectura obligatoria/ });
    expect(pdf).toHaveAttribute('target', '_blank');
    expect(pdf).toHaveAttribute('rel', 'noopener noreferrer');
    // Un video sin id reconocible se muestra como enlace.
    expect(screen.getByRole('link', { name: /Video roto/ })).toHaveAttribute('href', 'https://youtube.com/channel/x');

    expect(screen.getByRole('button', { name: /Ver clase grabada/ })).toBeDisabled();
    expect(await screen.findByRole('link', { name: /Hacer examen/ })).toHaveAttribute('href', '/examenes/e1');
  });

  it('sin contenido ni examen muestra los mensajes correspondientes', async () => {
    renderApp('/materias/m1/semanas/3', { sesion: sesionAlumno, preparar: (r) => r.materias.lista.push(materiaEjemplo) });
    expect(await screen.findByText('El maestro aún no publica el contenido de esta semana')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Sin examen esta semana/ })).toBeDisabled();
  });

  it('si ya respondió muestra la calificación en lugar del botón', async () => {
    renderApp('/materias/m1/semanas/2', {
      sesion: sesionAlumno,
      preparar: (r) => {
        r.materias.lista.push(materiaEjemplo);
        r.examenes.lista.push({
          ...examenSemana2,
          miIntento: { aciertos: 2, totalPreguntas: 2, calificacion: 10, fecha: '2026-08-12T00:00:00Z' },
        });
      },
    });
    expect(await screen.findByText(/Calificación: 10 \/ 10/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Hacer examen/ })).not.toBeInTheDocument();
  });

  it('el maestro ve las acciones de crear contenido y examen', async () => {
    renderApp('/materias/m1/semanas/1', { sesion: sesionMaestro, preparar: (r) => r.materias.lista.push(materiaEjemplo) });
    expect(await screen.findByRole('link', { name: /Crear contenido/ })).toHaveAttribute('href', '/materias/m1/semanas/1/contenido');
    expect(await screen.findByRole('link', { name: /Crear examen/ })).toHaveAttribute('href', '/materias/m1/semanas/1/examen');
  });
});

describe('examen del alumno', () => {
  it('requiere responder todo, confirma y muestra el resultado', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/examenes/e1', {
      sesion: sesionAlumno,
      preparar: (r) => r.examenes.lista.push({ ...examenSemana2 }),
    });

    expect(await screen.findByRole('heading', { name: 'Quiz semana 2' })).toBeInTheDocument();
    expect(screen.getByText(/Fecha límite:/)).toBeInTheDocument();
    const enviar = screen.getByRole('button', { name: /Enviar respuestas/ });
    expect(enviar).toBeDisabled();

    await usuario.click(within(screen.getByRole('group', { name: /2 \+ 2/ })).getByLabelText('4'));
    expect(enviar).toBeDisabled();
    await usuario.click(within(screen.getByRole('group', { name: /Color del cielo/ })).getByLabelText('Rojo'));
    expect(enviar).toBeEnabled();

    await usuario.click(enviar);
    const dialogo = screen.getByRole('dialog', { name: '¿Enviar tus respuestas?' });
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, enviar' }));

    expect(await screen.findByText('Aciertos: 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('Calificación: 5 / 10')).toBeInTheDocument();
    expect(repos.examenes.respuestasRecibidas).toEqual([[1, 2]]);
    expect(screen.queryByRole('button', { name: /Enviar respuestas/ })).not.toBeInTheDocument();
  });
});

describe('editor de contenido (maestro)', () => {
  it('valida URLs y crea el contenido de la semana', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp('/materias/m1/semanas/1/contenido', {
      sesion: sesionMaestro,
      preparar: (r) => r.materias.lista.push(materiaEjemplo),
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
});
