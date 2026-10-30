import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { preguntasEjemplo, resumenExamen, sesionAlumno, ventanas } from '../test/datos';
import { renderApp } from '../test/renderApp';
import { RevisionExamen } from './components/examen/RevisionExamen';

const ruta = '/grupos/g1/examenes/e1';

describe('RevisionExamen', () => {
  it('marca aciertos y errores, la respuesta del alumno y la correcta', () => {
    render(
      <RevisionExamen
        preguntas={[
          { id: 'p1', enunciado: '¿2 + 2?', opciones: ['3', '4'], respuestaCorrecta: 1, miRespuesta: 1, acierto: true },
          { id: 'p2', enunciado: '¿Cielo?', opciones: ['Azul', 'Rojo'], respuestaCorrecta: 0, miRespuesta: 1, acierto: false },
        ]}
      />,
    );
    expect(screen.getByText('1 de 2 correctas')).toBeInTheDocument();
    const primera = screen.getByRole('article', { name: 'Pregunta 1' });
    expect(within(primera).getByText('✓ Correcta')).toBeInTheDocument();
    const segunda = screen.getByRole('article', { name: 'Pregunta 2' });
    expect(within(segunda).getByText('✗ Incorrecta')).toBeInTheDocument();
    expect(within(segunda).getByText('Rojo').closest('li')).toHaveTextContent('Tu respuesta');
    const correcta = within(segunda).getByText('Azul').closest('li');
    expect(correcta).toHaveTextContent('Respuesta correcta');
    expect(correcta).toHaveAttribute('data-correcta', 'true');
  });
});

describe('pantalla de examen del alumno', () => {
  it('pide confirmación, envía una sola vez y muestra la revisión pregunta por pregunta', async () => {
    const usuario = userEvent.setup();
    const { repos } = renderApp(ruta, {
      sesion: sesionAlumno,
      preparar: (r) => r.examenesGrupo.lista.push({ grupoId: 'g1', resumen: resumenExamen(), preguntas: preguntasEjemplo }),
    });

    expect(await screen.findByRole('heading', { name: 'Quiz semana 2' })).toBeInTheDocument();
    expect(screen.getByText(/Disponible hasta el 10 de enero de 2099/)).toBeInTheDocument();
    const enviar = screen.getByRole('button', { name: /Enviar respuestas/ });
    expect(enviar).toBeDisabled();

    await usuario.click(within(screen.getByRole('group', { name: /2 \+ 2/ })).getByLabelText('4'));
    expect(enviar).toBeDisabled();
    await usuario.click(within(screen.getByRole('group', { name: /Color del cielo/ })).getByLabelText('Rojo'));
    expect(enviar).toBeEnabled();

    await usuario.click(enviar);
    const dialogo = screen.getByRole('dialog', { name: '¿Enviar tus respuestas?' });
    expect(dialogo).toHaveTextContent('Solo tienes un intento');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, enviar' }));

    expect(await screen.findByText('Calificación: 5 / 10')).toBeInTheDocument();
    expect(screen.getByText('Aciertos: 1 de 2')).toBeInTheDocument();
    expect(repos.examenesGrupo.respuestasRecibidas).toEqual([[1, 2]]);
    expect(screen.queryByRole('button', { name: /Enviar respuestas/ })).not.toBeInTheDocument();

    const segunda = screen.getByRole('article', { name: 'Pregunta 2' });
    expect(within(segunda).getByText('✗ Incorrecta')).toBeInTheDocument();
    expect(within(segunda).getByText('Rojo').closest('li')).toHaveTextContent('Tu respuesta');
    expect(within(segunda).getByText('Azul').closest('li')).toHaveTextContent('Respuesta correcta');
    expect(within(screen.getByRole('article', { name: 'Pregunta 1' })).getByText('✓ Correcta')).toBeInTheDocument();
  });

  it('si ya respondió muestra directamente su calificación y la revisión', async () => {
    renderApp(ruta, {
      sesion: sesionAlumno,
      preparar: (r) =>
        r.examenesGrupo.lista.push({
          grupoId: 'g1',
          resumen: resumenExamen({
            ventana: ventanas.cerrada,
            miIntento: { aciertos: 2, totalPreguntas: 2, calificacion: 10, fecha: '2026-08-12T15:00:00.000Z' },
          }),
          preguntas: preguntasEjemplo,
          respuestas: [1, 0],
        }),
    });

    expect(await screen.findByText('Calificación: 10 / 10')).toBeInTheDocument();
    expect(screen.getByText('2 de 2 correctas')).toBeInTheDocument();
    expect(screen.getAllByText('✓ Correcta')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /Enviar respuestas/ })).not.toBeInTheDocument();
  });

  it('antes de abrir explica cuándo podrá responder', async () => {
    renderApp(ruta, {
      sesion: sesionAlumno,
      preparar: (r) =>
        r.examenesGrupo.lista.push({ grupoId: 'g1', resumen: resumenExamen({ ventana: ventanas.proxima }), preguntas: preguntasEjemplo }),
    });
    expect(await screen.findByText('Este examen todavía no abre')).toBeInTheDocument();
    expect(screen.getByText(/Podrás responderlo a partir del 2 de marzo de 2099/)).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('si cerró sin responder lo indica', async () => {
    renderApp(ruta, {
      sesion: sesionAlumno,
      preparar: (r) =>
        r.examenesGrupo.lista.push({ grupoId: 'g1', resumen: resumenExamen({ ventana: ventanas.cerrada }), preguntas: preguntasEjemplo }),
    });
    expect(await screen.findByText('Este examen ya cerró')).toBeInTheDocument();
    expect(screen.getByText(/Cerró el 10 de enero de 2020/)).toBeInTheDocument();
  });

  it('el examen final vuelve al inicio', async () => {
    renderApp(ruta, {
      sesion: sesionAlumno,
      preparar: (r) =>
        r.examenesGrupo.lista.push({
          grupoId: 'g1',
          resumen: resumenExamen({ tipo: 'Final', semana: undefined, titulo: 'Examen final' }),
          preguntas: preguntasEjemplo,
        }),
    });
    expect(await screen.findByRole('heading', { name: 'Examen final' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver al inicio/ })).toHaveAttribute('href', '/');
  });
});
