import { describe, expect, it } from 'vitest';
import type { ResumenExamen } from '../domain/entities/Examen';
import { ErrorAplicacion } from '../domain/errors/ErrorAplicacion';
import { crearRepositoriosFalsos, grupoEjemplo, usuarioAlumno } from '../test/fakes';
import { IniciarSesion } from './auth/IniciarSesion';
import { EliminarContenidoSemana } from './contenido/EliminarContenidoSemana';
import { GuardarContenidoSemana } from './contenido/GuardarContenidoSemana';
import { ActualizarExamen } from './examenes/ActualizarExamen';
import { CrearExamen } from './examenes/CrearExamen';
import { EliminarExamen } from './examenes/EliminarExamen';
import { ObtenerExamenesSemana } from './examenesGrupo/ObtenerExamenesSemana';
import { ObtenerExamenGrupo } from './examenesGrupo/ObtenerExamenGrupo';
import { ObtenerIntentosExamen } from './examenesGrupo/ObtenerIntentosExamen';
import { ResponderExamen } from './examenesGrupo/ResponderExamen';
import { CrearGrupo } from './grupos/CrearGrupo';
import { EliminarGrupo } from './grupos/EliminarGrupo';
import { InscribirAlumnos } from './grupos/InscribirAlumnos';
import { ObtenerCalificaciones } from './grupos/ObtenerCalificaciones';
import { ActualizarMateria } from './materias/ActualizarMateria';
import { CrearMateria } from './materias/CrearMateria';
import { EliminarMateria } from './materias/EliminarMateria';
import { CrearUsuario } from './usuarios/CrearUsuario';

const resumen = (cambios: Partial<ResumenExamen> = {}): ResumenExamen => ({
  id: 'e1',
  tipo: 'Semanal',
  semana: 1,
  titulo: 'Semana 1',
  puntajeMaximo: 10,
  totalPreguntas: 2,
  ventana: { abre: '2026-08-03T00:00:00Z', cierra: '2026-08-09T23:59:59Z', estado: 'abierta' },
  miIntento: null,
  ...cambios,
});

const preguntas = [
  { id: 'p1', enunciado: 'A', opciones: ['x', 'y'], respuestaCorrecta: 0 },
  { id: 'p2', enunciado: 'B', opciones: ['x', 'y'], respuestaCorrecta: 1 },
];

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

describe('ResponderExamen (en un grupo)', () => {
  const preparar = (cambios: Partial<ResumenExamen> = {}) => {
    const r = crearRepositoriosFalsos();
    r.examenesGrupo.lista.push({ grupoId: 'g1', resumen: resumen(cambios), preguntas });
    return r;
  };

  it('rechaza si falta alguna respuesta sin llamar al repositorio', async () => {
    const r = preparar();
    const caso = new ResponderExamen(r.examenesGrupo);
    await expect(caso.ejecutar({ grupoId: 'g1', examenId: 'e1', respuestas: [0, null], totalPreguntas: 2 })).rejects.toThrow(
      /Responde todas/,
    );
    expect(r.examenesGrupo.respuestasRecibidas).toHaveLength(0);
  });

  it('envía las respuestas y devuelve resultado con revisión por pregunta', async () => {
    const r = preparar();
    const resultado = await new ResponderExamen(r.examenesGrupo).ejecutar({
      grupoId: 'g1',
      examenId: 'e1',
      respuestas: [0, 0],
      totalPreguntas: 2,
    });
    expect(r.examenesGrupo.respuestasRecibidas).toEqual([[0, 0]]);
    expect(resultado).toMatchObject({ aciertos: 1, totalPreguntas: 2, calificacion: 5 });
    expect(resultado.revision.map((p) => [p.miRespuesta, p.respuestaCorrecta, p.acierto])).toEqual([
      [0, 0, true],
      [0, 1, false],
    ]);
  });

  it('propaga el 409 si ya respondió y el 403 si la ventana cerró', async () => {
    const r = preparar();
    const caso = new ResponderExamen(r.examenesGrupo);
    const solicitud = { grupoId: 'g1', examenId: 'e1', respuestas: [0, 1], totalPreguntas: 2 };
    await caso.ejecutar(solicitud);
    await expect(caso.ejecutar(solicitud)).rejects.toMatchObject({ estado: 409 });

    const cerrado = preparar({ ventana: { abre: '2026-08-03', cierra: '2026-08-09', estado: 'cerrada' } });
    await expect(new ResponderExamen(cerrado.examenesGrupo).ejecutar(solicitud)).rejects.toMatchObject({ estado: 403 });
  });
});

describe('consultas de exámenes del grupo', () => {
  it('ObtenerExamenesSemana separa semanal y reposición', async () => {
    const r = crearRepositoriosFalsos();
    r.examenesGrupo.lista.push(
      { grupoId: 'g1', resumen: resumen(), preguntas },
      { grupoId: 'g1', resumen: resumen({ id: 'e2', tipo: 'Reposicion' }), preguntas },
    );
    const semana = await new ObtenerExamenesSemana(r.examenesGrupo).ejecutar('g1', 1);
    expect(semana.semanal?.id).toBe('e1');
    expect(semana.reposicion?.id).toBe('e2');
    expect(await new ObtenerExamenesSemana(r.examenesGrupo).ejecutar('g1', 2)).toEqual({ semanal: null, reposicion: null });
  });

  it('ObtenerExamenGrupo no entrega preguntas si la ventana no está abierta', async () => {
    const r = crearRepositoriosFalsos();
    r.examenesGrupo.lista.push({
      grupoId: 'g1',
      resumen: resumen({ ventana: { abre: '2099-01-01', cierra: '2099-01-08', estado: 'proxima' } }),
      preguntas,
    });
    const examen = await new ObtenerExamenGrupo(r.examenesGrupo).ejecutar('g1', 'e1');
    expect(examen?.preguntas).toEqual([]);
    expect(await new ObtenerExamenGrupo(r.examenesGrupo).ejecutar('g1', 'nada')).toBeNull();
  });

  it('ObtenerIntentosExamen ordena por nombre del alumno', async () => {
    const r = crearRepositoriosFalsos();
    const intento = (id: string, nombre: string) => ({
      id,
      examenId: 'e1',
      alumno: { id, nombre, correo: '' },
      respuestas: [],
      aciertos: 0,
      totalPreguntas: 1,
      calificacion: 0,
      fecha: '',
    });
    r.examenesGrupo.intentos.push(intento('i1', 'Zoe'), intento('i2', 'Ana'));
    const lista = await new ObtenerIntentosExamen(r.examenesGrupo).ejecutar('g1', 'e1');
    expect(lista.map((i) => i.alumno.nombre)).toEqual(['Ana', 'Zoe']);
  });
});

describe('CrearExamen / ActualizarExamen / EliminarExamen', () => {
  const pregunta = { enunciado: ' ¿Capital de Jalisco? ', opciones: ['Guadalajara ', 'Monterrey'], respuestaCorrecta: 0 };

  it('aplica puntaje y días extra por defecto y limpia espacios', async () => {
    const r = crearRepositoriosFalsos();
    const examen = await new CrearExamen(r.examenes).ejecutar({
      materiaId: 'm1',
      tipo: 'Semanal',
      semana: 2,
      titulo: ' Quiz ',
      preguntas: [pregunta],
    });
    expect(examen).toMatchObject({ puntajeMaximo: 100, diasExtra: 0, titulo: 'Quiz', semana: 2 });
    expect(examen.preguntas[0]).toEqual({ enunciado: '¿Capital de Jalisco?', opciones: ['Guadalajara', 'Monterrey'], respuestaCorrecta: 0 });
  });

  it('el Final nunca envía semana', async () => {
    const r = crearRepositoriosFalsos();
    await new CrearExamen(r.examenes).ejecutar({ materiaId: 'm1', tipo: 'Final', semana: 4, titulo: 'Final', preguntas: [pregunta] });
    expect(r.examenes.creados[0]).not.toHaveProperty('semana');
    expect(r.examenes.creados[0]).toMatchObject({ tipo: 'Final', diasExtra: 0 });
  });

  it('valida semana, días extra y preguntas antes de llamar al repositorio', async () => {
    const r = crearRepositoriosFalsos();
    const caso = new CrearExamen(r.examenes);
    await expect(caso.ejecutar({ materiaId: 'm1', tipo: 'Reposicion', titulo: 'X', preguntas: [pregunta] })).rejects.toThrow(
      /semana/,
    );
    await expect(
      caso.ejecutar({ materiaId: 'm1', tipo: 'Semanal', semana: 1, diasExtra: 40, titulo: 'X', preguntas: [pregunta] }),
    ).rejects.toThrow(/días extra/);
    await expect(caso.ejecutar({ materiaId: 'm1', tipo: 'Semanal', semana: 1, titulo: 'X', preguntas: [] })).rejects.toThrow(
      /al menos una pregunta/,
    );
    await expect(
      caso.ejecutar({
        materiaId: 'm1',
        tipo: 'Semanal',
        semana: 1,
        titulo: 'X',
        preguntas: [{ enunciado: 'P', opciones: ['a'], respuestaCorrecta: 0 }],
      }),
    ).rejects.toThrow(/Pregunta 1/);
    expect(r.examenes.creados).toHaveLength(0);
  });

  it('al actualizar sin preguntas no las envía y valida días extra', async () => {
    const r = crearRepositoriosFalsos();
    const creado = await new CrearExamen(r.examenes).ejecutar({ materiaId: 'm1', tipo: 'Final', titulo: 'X', preguntas: [pregunta] });
    const caso = new ActualizarExamen(r.examenes);
    await caso.ejecutar(creado.id, { titulo: 'Nuevo', diasExtra: 3 });
    expect(r.examenes.actualizaciones[0]?.cambios).toEqual({ titulo: 'Nuevo', diasExtra: 3 });
    await expect(caso.ejecutar(creado.id, { diasExtra: -2 })).rejects.toThrow(/días extra/);
  });

  it('EliminarExamen propaga el 409 del backend', async () => {
    const r = crearRepositoriosFalsos();
    r.examenes.errorAlEliminar = new ErrorAplicacion('Primero elimina la reposición de esta semana.', 409);
    await expect(new EliminarExamen(r.examenes).ejecutar('e1')).rejects.toMatchObject({
      estado: 409,
      message: 'Primero elimina la reposición de esta semana.',
    });
  });
});

describe('contenido semanal', () => {
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

  it('elimina por id', async () => {
    const r = crearRepositoriosFalsos();
    const creado = await new GuardarContenidoSemana(r.contenido).ejecutar({ materiaId: 'm1', semana: 3, datos });
    await new EliminarContenidoSemana(r.contenido).ejecutar(creado.id);
    expect(await r.contenido.obtenerPorSemana('m1', 3)).toBeNull();
  });
});

describe('materias', () => {
  it('CrearMateria aplica 16 semanas por defecto y omite descripción vacía', async () => {
    const r = crearRepositoriosFalsos();
    const materia = await new CrearMateria(r.materias).ejecutar({ nombre: ' Ética ', descripcion: ' ' });
    expect(materia).toEqual({ id: 'm1', nombre: 'Ética', totalSemanas: 16 });
    expect(r.materias.creadas[0]).toEqual({ nombre: 'Ética', descripcion: undefined, totalSemanas: 16 });
  });

  it('valida nombre y total de semanas (1 a 52)', async () => {
    const r = crearRepositoriosFalsos();
    await expect(new CrearMateria(r.materias).ejecutar({ nombre: '', totalSemanas: 60 })).rejects.toMatchObject({
      mensajes: ['El nombre es obligatorio.', 'El total de semanas debe ser un entero entre 1 y 52.'],
    });
  });

  it('ActualizarMateria envía solo lo que cambia (permite borrar la descripción)', async () => {
    const r = crearRepositoriosFalsos();
    const materia = await new CrearMateria(r.materias).ejecutar({ nombre: 'Ética', descripcion: 'Algo' });
    await new ActualizarMateria(r.materias).ejecutar(materia.id, { descripcion: ' ', totalSemanas: 18 });
    expect(r.materias.actualizaciones[0]).toEqual({ id: materia.id, cambios: { descripcion: '', totalSemanas: 18 } });
  });

  it('EliminarMateria propaga el 409 cuando la materia tiene grupos', async () => {
    const r = crearRepositoriosFalsos();
    r.materias.conGrupos.add('m1');
    await expect(new EliminarMateria(r.materias).ejecutar('m1')).rejects.toMatchObject({ estado: 409 });
  });
});

describe('grupos', () => {
  const nuevo = { materiaId: 'm1', maestroId: 'u2', nombre: ' 05 ', periodo: ' 2026-B ', aula: ' ', fechaInicio: '2026-08-03' };

  it('CrearGrupo limpia espacios y omite el aula vacía', async () => {
    const r = crearRepositoriosFalsos();
    await new CrearGrupo(r.grupos).ejecutar(nuevo);
    expect(r.grupos.creados[0]).toEqual({ materiaId: 'm1', maestroId: 'u2', nombre: '05', periodo: '2026-B', fechaInicio: '2026-08-03' });
  });

  it('CrearGrupo reporta todos los campos faltantes', async () => {
    const r = crearRepositoriosFalsos();
    await expect(
      new CrearGrupo(r.grupos).ejecutar({ materiaId: '', maestroId: '', nombre: '', periodo: '', fechaInicio: '3/8/2026' }),
    ).rejects.toMatchObject({ mensajes: expect.arrayContaining(['Elige una materia.', 'Elige un maestro.']) as unknown });
    expect(r.grupos.creados).toHaveLength(0);
  });

  it('InscribirAlumnos elimina duplicados y exige al menos uno', async () => {
    const r = crearRepositoriosFalsos();
    const caso = new InscribirAlumnos(r.grupos);
    await expect(caso.ejecutar('g1', [])).rejects.toThrow(/al menos un alumno/);
    const inscritos = await caso.ejecutar('g1', ['a1', 'a1', 'a2']);
    expect(inscritos.map((a) => a.id)).toEqual(['a1', 'a2']);
  });

  it('EliminarGrupo lo quita de la lista', async () => {
    const r = crearRepositoriosFalsos();
    r.grupos.lista.push(grupoEjemplo);
    await new EliminarGrupo(r.grupos).ejecutar('g1');
    expect(r.grupos.lista).toHaveLength(0);
  });

  it('ObtenerCalificaciones ordena alumnos por nombre y semanas por número', async () => {
    const r = crearRepositoriosFalsos();
    const nota = { calificacion: 8, puntajeMaximo: 10 };
    r.grupos.calificaciones.g1 = [
      {
        alumno: { id: 'a2', nombre: 'Zoe' },
        semanas: [
          { semana: 2, semanal: nota, reposicion: null, mejor: nota },
          { semana: 1, semanal: null, reposicion: null, mejor: null },
        ],
        final: null,
      },
      { alumno: { id: 'a1', nombre: 'Ana' }, semanas: [], final: nota },
    ];
    const lista = await new ObtenerCalificaciones(r.grupos).ejecutar('g1');
    expect(lista.map((c) => c.alumno.nombre)).toEqual(['Ana', 'Zoe']);
    expect(lista[1]?.semanas.map((s) => s.semana)).toEqual([1, 2]);
  });
});

describe('usuarios', () => {
  it('CrearUsuario valida la contraseña mínima', async () => {
    const r = crearRepositoriosFalsos();
    await expect(
      new CrearUsuario(r.usuarios).ejecutar({ nombre: 'A', correo: 'a@a.mx', password: '123', rol: 'alumno' }),
    ).rejects.toThrow(/al menos 6/);
  });
});
