import { describe, expect, it } from 'vitest';
import { ErrorAplicacion } from '../domain/errors/ErrorAplicacion';
import { crearRepositoriosFalsos, usuarioAlumno } from '../test/fakes';
import { IniciarSesion } from './auth/IniciarSesion';
import { GuardarContenidoSemana } from './contenido/GuardarContenidoSemana';
import { ActualizarExamen } from './examenes/ActualizarExamen';
import { CrearExamen } from './examenes/CrearExamen';
import { ResponderExamen } from './examenes/ResponderExamen';
import { CrearMateria } from './materias/CrearMateria';
import { InscribirAlumnos } from './materias/InscribirAlumnos';
import { CrearUsuario } from './usuarios/CrearUsuario';

describe('IniciarSesion', () => {
  it('normaliza el correo, autentica y guarda la sesión', async () => {
    const r = crearRepositoriosFalsos();
    r.auth.usuarios['ana@escuela.mx'] = { password: 'secreto', usuario: usuarioAlumno };
    const sesion = await new IniciarSesion(r.auth, r.sesiones).ejecutar('  Ana@Escuela.MX ', 'secreto');
    expect(sesion.usuario.rol).toBe('alumno');
    expect(r.sesiones.obtener()?.token).toBe('token-u1');
  });

  it('no guarda nada si las credenciales son inválidas', async () => {
    const r = crearRepositoriosFalsos();
    await expect(new IniciarSesion(r.auth, r.sesiones).ejecutar('x@x.mx', 'mal')).rejects.toMatchObject({ estado: 401 });
    expect(r.sesiones.obtener()).toBeNull();
  });

  it('exige correo y contraseña', async () => {
    const r = crearRepositoriosFalsos();
    await expect(new IniciarSesion(r.auth, r.sesiones).ejecutar('', '')).rejects.toBeInstanceOf(ErrorAplicacion);
  });
});

describe('ResponderExamen', () => {
  const preparar = () => {
    const r = crearRepositoriosFalsos();
    r.examenes.lista.push({
      id: 'e1',
      materiaId: 'm1',
      semana: 1,
      titulo: 'Semana 1',
      tipo: 'Semanal',
      puntajeMaximo: 10,
      preguntas: [
        { enunciado: 'A', opciones: ['x', 'y'], respuestaCorrecta: 0 },
        { enunciado: 'B', opciones: ['x', 'y'], respuestaCorrecta: 1 },
      ],
    });
    return r;
  };

  it('rechaza si falta alguna respuesta sin llamar al repositorio', async () => {
    const r = preparar();
    await expect(new ResponderExamen(r.examenes).ejecutar('e1', [0, null], 2)).rejects.toThrow(/Responde todas/);
    expect(r.examenes.respuestasRecibidas).toHaveLength(0);
  });

  it('envía las respuestas en orden y devuelve el resultado', async () => {
    const r = preparar();
    const resultado = await new ResponderExamen(r.examenes).ejecutar('e1', [0, 0], 2);
    expect(r.examenes.respuestasRecibidas).toEqual([[0, 0]]);
    expect(resultado).toMatchObject({ aciertos: 1, totalPreguntas: 2, calificacion: 5 });
  });
});

describe('CrearExamen / ActualizarExamen', () => {
  const pregunta = { enunciado: ' ¿Capital de Jalisco? ', opciones: ['Guadalajara ', 'Monterrey'], respuestaCorrecta: 0 };

  it('aplica puntaje por defecto y limpia espacios', async () => {
    const r = crearRepositoriosFalsos();
    const examen = await new CrearExamen(r.examenes).ejecutar({ materiaId: 'm1', semana: 2, titulo: ' Quiz ', preguntas: [pregunta] });
    expect(examen.puntajeMaximo).toBe(100);
    expect(examen.titulo).toBe('Quiz');
    expect(examen.preguntas[0]).toEqual({ enunciado: '¿Capital de Jalisco?', opciones: ['Guadalajara', 'Monterrey'], respuestaCorrecta: 0 });
  });

  it('rechaza exámenes sin preguntas o con preguntas inválidas', async () => {
    const r = crearRepositoriosFalsos();
    const caso = new CrearExamen(r.examenes);
    await expect(caso.ejecutar({ materiaId: 'm1', titulo: 'X', preguntas: [] })).rejects.toThrow(/al menos una pregunta/);
    await expect(
      caso.ejecutar({ materiaId: 'm1', titulo: 'X', preguntas: [{ enunciado: 'P', opciones: ['a'], respuestaCorrecta: 0 }] }),
    ).rejects.toThrow(/Pregunta 1/);
  });

  it('al actualizar sin preguntas no las envía', async () => {
    const r = crearRepositoriosFalsos();
    const creado = await new CrearExamen(r.examenes).ejecutar({ materiaId: 'm1', titulo: 'X', preguntas: [pregunta] });
    await new ActualizarExamen(r.examenes).ejecutar(creado.id, { titulo: 'Nuevo' });
    expect(r.examenes.actualizaciones[0]?.cambios).toEqual({ titulo: 'Nuevo' });
  });
});

describe('GuardarContenidoSemana', () => {
  const datos = {
    tema: '  Pensamiento de diseño ',
    introduccion: '',
    recursos: [{ tipo: 'pdf' as const, titulo: ' Lectura ', url: ' https://a.mx/l.pdf ', descripcion: ' ' }],
    links: { grabacion: '', presentacion: 'https://a.mx/p' },
  };

  it('crea cuando no hay id, limpiando campos vacíos', async () => {
    const r = crearRepositoriosFalsos();
    await new GuardarContenidoSemana(r.contenido).ejecutar({ materiaId: 'm1', semana: 3, datos });
    expect(r.contenido.creados[0]).toEqual({
      materiaId: 'm1',
      semana: 3,
      tema: 'Pensamiento de diseño',
      introduccion: undefined,
      recursos: [{ tipo: 'pdf', titulo: 'Lectura', url: 'https://a.mx/l.pdf' }],
      links: { presentacion: 'https://a.mx/p' },
    });
  });

  it('actualiza cuando hay id', async () => {
    const r = crearRepositoriosFalsos();
    const creado = await new GuardarContenidoSemana(r.contenido).ejecutar({ materiaId: 'm1', semana: 3, datos });
    await new GuardarContenidoSemana(r.contenido).ejecutar({ id: creado.id, materiaId: 'm1', semana: 3, datos: { ...datos, tema: 'Otro' } });
    expect(r.contenido.actualizados[0]).toMatchObject({ id: creado.id, cambios: { tema: 'Otro', introduccion: '' } });
  });

  it('exige tema', async () => {
    const r = crearRepositoriosFalsos();
    await expect(
      new GuardarContenidoSemana(r.contenido).ejecutar({ materiaId: 'm1', semana: 1, datos: { ...datos, tema: ' ' } }),
    ).rejects.toThrow(/tema/);
  });
});

describe('administración', () => {
  it('CrearUsuario valida la contraseña mínima', async () => {
    const r = crearRepositoriosFalsos();
    await expect(
      new CrearUsuario(r.usuarios).ejecutar({ nombre: 'A', correo: 'a@a.mx', password: '123', rol: 'alumno' }),
    ).rejects.toThrow(/al menos 6/);
  });

  it('CrearMateria aplica 16 semanas por defecto', async () => {
    const r = crearRepositoriosFalsos();
    const materia = await new CrearMateria(r.materias).ejecutar({ nombre: 'Ética', maestroId: 'u2', fechaInicio: '2026-08-03' });
    expect(materia.totalSemanas).toBe(16);
  });

  it('InscribirAlumnos elimina duplicados y exige al menos uno', async () => {
    const r = crearRepositoriosFalsos();
    const caso = new InscribirAlumnos(r.materias);
    await expect(caso.ejecutar('m1', [])).rejects.toThrow(/al menos un alumno/);
    const inscritos = await caso.ejecutar('m1', ['a1', 'a1', 'a2']);
    expect(inscritos.map((a) => a.id)).toEqual(['a1', 'a2']);
  });
});
