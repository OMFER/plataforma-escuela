import { describe, expect, it } from 'vitest';
import type { ResumenExamen } from '../domain/entities/Examen';
import { ErrorAplicacion } from '../domain/errors/ErrorAplicacion';
import { boletaMateria } from '../test/datos';
import { crearRepositoriosFalsos, grupoEjemplo, sembrarPlan, usuarioAlumno } from '../test/fakes';
import { IniciarSesion } from './auth/IniciarSesion';
import { EliminarContenidoSemana } from './contenido/EliminarContenidoSemana';
import { GuardarContenidoSemana } from './contenido/GuardarContenidoSemana';
import { ListarContenidoMateria } from './contenido/ListarContenidoMateria';
import { ActualizarExamen } from './examenes/ActualizarExamen';
import { CrearExamen } from './examenes/CrearExamen';
import { ImportarExamenes } from './examenes/ImportarExamenes';
import { ListarExamenesMateria } from './examenes/ListarExamenesMateria';
import { ObtenerExamenesSemana } from './examenesGrupo/ObtenerExamenesSemana';
import { ObtenerExamenGrupo } from './examenesGrupo/ObtenerExamenGrupo';
import { ResponderExamen } from './examenesGrupo/ResponderExamen';
import { CrearGrupo } from './grupos/CrearGrupo';
import { EliminarGrupo } from './grupos/EliminarGrupo';
import { InscribirAlumnos } from './grupos/InscribirAlumnos';
import { ObtenerCalificaciones } from './grupos/ObtenerCalificaciones';
import { ActualizarMateria } from './materias/ActualizarMateria';
import { CrearMateria } from './materias/CrearMateria';
import { EliminarMateria } from './materias/EliminarMateria';
import { ListarMisMaterias } from './materias/ListarMisMaterias';
import { CrearNuevaVersion } from './planes/CrearNuevaVersion';
import { CrearPlan } from './planes/CrearPlan';
import { PublicarPlan } from './planes/PublicarPlan';
import { CrearUsuario } from './usuarios/CrearUsuario';

const resumen = (cambios: Partial<ResumenExamen> = {}): ResumenExamen => ({
  id: 'e1',
  materia: { id: 'm1', nombre: 'Matemáticas' },
  semana: 1,
  numero: 1,
  semanaDelGrupo: 1,
  titulo: 'Semana 1 · Examen 1',
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

  it('envía las respuestas y devuelve la revisión sin la clave mientras el examen sigue abierto', async () => {
    const r = preparar();
    const resultado = await new ResponderExamen(r.examenesGrupo).ejecutar({
      grupoId: 'g1',
      examenId: 'e1',
      respuestas: [0, 0],
      totalPreguntas: 2,
    });
    expect(r.examenesGrupo.respuestasRecibidas).toEqual([[0, 0]]);
    expect(resultado).toMatchObject({ aciertos: 1, totalPreguntas: 2, calificacion: 5 });
    expect(resultado.revision.map((p) => [p.miRespuesta, p.acierto, p.respuestaCorrecta])).toEqual([
      [0, true, undefined],
      [0, false, undefined],
    ]);
    expect(resultado.ventana?.estado).toBe('abierta');
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
  it('ObtenerExamenesSemana trae los dos exámenes de esa semana de la materia, en orden', async () => {
    const r = crearRepositoriosFalsos();
    r.examenesGrupo.lista.push(
      { grupoId: 'g1', resumen: resumen({ id: 'e2', numero: 2 }), preguntas },
      { grupoId: 'g1', resumen: resumen({ id: 'e1', numero: 1 }), preguntas },
      { grupoId: 'g1', resumen: resumen({ id: 'e3', materia: { id: 'm2', nombre: 'Historia' } }), preguntas },
      { grupoId: 'g1', resumen: resumen({ id: 'e4', semana: 2 }), preguntas },
    );
    const examenes = await new ObtenerExamenesSemana(r.examenesGrupo).ejecutar('g1', 'm1', 1);
    expect(examenes.map((e) => e.id)).toEqual(['e1', 'e2']);
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
  });
});

describe('exámenes de la materia', () => {
  const nuevo = { materiaId: 'm1', semana: 2, numero: 2, titulo: '  Repaso ', descripcion: ' ', preguntas };

  it('CrearExamen limpia espacios y aplica 0 días extra', async () => {
    const r = crearRepositoriosFalsos();
    await new CrearExamen(r.examenes).ejecutar(nuevo);
    expect(r.examenes.creados[0]).toMatchObject({ semana: 2, numero: 2, titulo: 'Repaso', diasExtra: 0, descripcion: undefined });
  });

  it('valida semana, número, días extra y preguntas antes de llamar al repositorio', async () => {
    const r = crearRepositoriosFalsos();
    const caso = new CrearExamen(r.examenes);
    await expect(caso.ejecutar({ ...nuevo, semana: 3, numero: 0, diasExtra: 40 })).rejects.toMatchObject({
      mensajes: [
        'Los días extra deben ser un número entero entre 0 y 30.',
        'Elige la semana 1 o 2 de la materia.',
        'Elige el examen 1 o 2 de la semana.',
      ],
    });
    await expect(caso.ejecutar({ ...nuevo, preguntas: [] })).rejects.toThrow(/al menos una pregunta/);
    expect(r.examenes.creados).toHaveLength(0);
  });

  it('ActualizarExamen sin preguntas no las envía', async () => {
    const r = crearRepositoriosFalsos();
    const creado = await new CrearExamen(r.examenes).ejecutar(nuevo);
    await new ActualizarExamen(r.examenes).ejecutar(creado.id, { titulo: ' Nuevo ', diasExtra: 2 });
    expect(r.examenes.actualizaciones[0]?.cambios).toEqual({ titulo: 'Nuevo', diasExtra: 2 });
  });

  it('ListarExamenesMateria ordena por semana y número', async () => {
    const r = crearRepositoriosFalsos();
    for (const [semana, numero] of [[2, 1], [1, 2], [1, 1]]) {
      await new CrearExamen(r.examenes).ejecutar({ ...nuevo, semana, numero });
    }
    const lista = await new ListarExamenesMateria(r.examenes).ejecutar('m1');
    expect(lista.map((e) => [e.semana, e.numero])).toEqual([[1, 1], [1, 2], [2, 1]]);
  });

  it('ImportarExamenes rechaza un archivo vacío y propaga los errores por fila', async () => {
    const r = crearRepositoriosFalsos();
    const caso = new ImportarExamenes(r.examenes);
    await expect(caso.ejecutar('m1', '  ')).rejects.toThrow(/vacío/);
    expect(r.examenes.importaciones).toHaveLength(0);

    r.examenes.errorAlImportar = new ErrorAplicacion(['La hoja tiene 1 error', 'Fila 3: la semana debe ser 1 o 2'], 400);
    await expect(caso.ejecutar('m1', 'semana,examen\n3,1')).rejects.toMatchObject({
      mensajes: ['La hoja tiene 1 error', 'Fila 3: la semana debe ser 1 o 2'],
    });
    expect(r.examenes.importaciones).toEqual([{ materiaId: 'm1', csv: 'semana,examen\n3,1' }]);
  });
});

describe('ListarContenidoMateria', () => {
  it('ordena el contenido por semana', async () => {
    const r = crearRepositoriosFalsos();
    for (const semana of [2, 1]) {
      await new GuardarContenidoSemana(r.contenido).ejecutar({ materiaId: 'm1', semana, datos: { tema: `T${semana}`, recursos: [] } });
    }
    const lista = await new ListarContenidoMateria(r.contenido).ejecutar('m1');
    expect(lista.map((c) => c.semana)).toEqual([1, 2]);
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

describe('planes de estudio', () => {
  it('CrearPlan exige nombre y omite la descripción vacía', async () => {
    const r = crearRepositoriosFalsos();
    const caso = new CrearPlan(r.planes);
    await expect(caso.ejecutar({ nombre: ' ' })).rejects.toThrow(/obligatorio/);
    const plan = await caso.ejecutar({ nombre: ' Prepa ', descripcion: ' ' });
    expect(r.planes.creados).toEqual([{ nombre: 'Prepa' }]);
    expect(plan).toMatchObject({ version: 1, estado: 'borrador' });
  });

  it('PublicarPlan propaga cada pendiente del servidor', async () => {
    const r = crearRepositoriosFalsos();
    const plan = sembrarPlan(r, { estado: 'borrador' });
    r.planes.pendientes[plan.id] = ['Química: falta el examen 2 de la semana 2'];
    await expect(new PublicarPlan(r.planes).ejecutar(plan.id)).rejects.toMatchObject({
      estado: 400,
      mensajes: expect.arrayContaining(['Química: falta el examen 2 de la semana 2']) as unknown,
    });
    r.planes.pendientes[plan.id] = [];
    await expect(new PublicarPlan(r.planes).ejecutar(plan.id)).resolves.toMatchObject({ estado: 'publicado' });
  });

  it('CrearNuevaVersion copia a un borrador con el siguiente número', async () => {
    const r = crearRepositoriosFalsos();
    const plan = sembrarPlan(r);
    const nueva = await new CrearNuevaVersion(r.planes).ejecutar(plan.id);
    expect(nueva).toMatchObject({ nombre: 'Prepa intensiva', version: 2, estado: 'borrador' });
    expect(r.planes.materias.filter((m) => m.planId === nueva.id)).toHaveLength(3);
  });
});

describe('materias', () => {
  it('CrearMateria limpia espacios, valida el bloque y omite lo vacío', async () => {
    const r = crearRepositoriosFalsos();
    const plan = sembrarPlan(r, { id: 'p2', estado: 'borrador' });
    const caso = new CrearMateria(r.materias);
    await expect(caso.ejecutar({ planId: plan.id, nombre: ' ', bloque: 0 })).rejects.toMatchObject({
      mensajes: ['El nombre es obligatorio.', 'El bloque debe ser un número entre 1 y 12.'],
    });
    await caso.ejecutar({ planId: plan.id, nombre: ' Física ', descripcion: ' ', bloque: 3, maestroId: '' });
    expect(r.materias.creadas).toEqual([{ planId: 'p2', nombre: 'Física', bloque: 3 }]);
  });

  it('en un plan publicado no se agregan ni se quitan materias', async () => {
    const r = crearRepositoriosFalsos();
    const plan = sembrarPlan(r);
    await expect(new CrearMateria(r.materias).ejecutar({ planId: plan.id, nombre: 'Física', bloque: 1 })).rejects.toMatchObject({
      estado: 409,
    });
    await expect(new EliminarMateria(r.materias).ejecutar('m1')).rejects.toMatchObject({ estado: 409 });
  });

  it('ActualizarMateria permite quitar al maestro y borrar la descripción', async () => {
    const r = crearRepositoriosFalsos();
    sembrarPlan(r);
    await new ActualizarMateria(r.materias).ejecutar('m1', { descripcion: ' ', maestroId: null });
    expect(r.materias.actualizaciones[0]?.cambios).toEqual({ descripcion: '', maestroId: null });
  });

  it('ListarMisMaterias trae las del maestro con su plan', async () => {
    const r = crearRepositoriosFalsos();
    sembrarPlan(r);
    const mias = await new ListarMisMaterias(r.materias).ejecutar();
    expect(mias.map((m) => [m.nombre, m.plan.version])).toEqual([
      ['Matemáticas', 1],
      ['Química', 1],
    ]);
  });
});

describe('grupos', () => {
  it('CrearGrupo limpia espacios y exige un lunes', async () => {
    const r = crearRepositoriosFalsos();
    const caso = new CrearGrupo(r.grupos);
    await expect(caso.ejecutar({ planId: 'p1', nombre: 'G', fechaInicio: '2026-08-04' })).rejects.toThrow(/lunes/);
    await caso.ejecutar({ planId: 'p1', nombre: ' Generación 1 ', fechaInicio: '2026-08-03' });
    expect(r.grupos.creados).toEqual([{ planId: 'p1', nombre: 'Generación 1', fechaInicio: '2026-08-03' }]);
  });

  it('CrearGrupo reporta todos los campos faltantes', async () => {
    const r = crearRepositoriosFalsos();
    await expect(new CrearGrupo(r.grupos).ejecutar({ planId: '', nombre: '', fechaInicio: '3/8/2026' })).rejects.toMatchObject({
      mensajes: [
        'Elige un plan publicado.',
        'El nombre del grupo es obligatorio.',
        'La fecha de inicio debe tener formato AAAA-MM-DD.',
      ],
    });
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

  it('EliminarGrupo lo quita de la lista', async () => {
    const r = crearRepositoriosFalsos();
    r.grupos.lista.push(grupoEjemplo);
    await new EliminarGrupo(r.grupos).ejecutar('g1');
    expect(r.grupos.lista).toHaveLength(0);
  });

  it('ObtenerCalificaciones ordena a los alumnos por nombre', async () => {
    const r = crearRepositoriosFalsos();
    const materias = [{ id: 'm1', nombre: 'Matemáticas', bloque: 1 }];
    r.grupos.calificaciones.g1 = {
      materias,
      boletas: [
        { alumno: { id: 'a2', nombre: 'Zoe' }, materias: [boletaMateria('m1', [8, 8, 8, 8])], promedioGeneral: 8 },
        { alumno: { id: 'a1', nombre: 'Ana' }, materias: [boletaMateria('m1', [5])], promedioGeneral: 1.3 },
      ],
    };
    const calificaciones = await new ObtenerCalificaciones(r.grupos).ejecutar('g1');
    expect(calificaciones.materias).toEqual(materias);
    expect(calificaciones.boletas.map((b) => b.alumno.nombre)).toEqual(['Ana', 'Zoe']);
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
