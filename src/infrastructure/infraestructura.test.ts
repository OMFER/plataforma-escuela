import { describe, expect, it, vi } from 'vitest';
import { ErrorAplicacion } from '../domain/errors/ErrorAplicacion';
import { FetchHttpClient, traducirError } from './http/FetchHttpClient';
import {
  aCalificaciones,
  aCambio,
  aExamen,
  aExamenGrupo,
  aGrupo,
  aMateriaEnPlan,
  aPlanDetallado,
  aResultadoConRevision,
  aResumenExamen,
  aUsuario,
} from './mappers/mappers';
import { HttpContenidoRepository } from './repositories/HttpContenidoRepository';
import { HttpExamenesGrupoRepository } from './repositories/HttpExamenesGrupoRepository';
import { HttpExamenesRepository } from './repositories/HttpExamenesRepository';
import { HttpGruposRepository } from './repositories/HttpGruposRepository';
import { HttpMateriasRepository } from './repositories/HttpMateriasRepository';
import { HttpPlanesRepository } from './repositories/HttpPlanesRepository';
import { LocalStorageSesionRepository } from './storage/LocalStorageSesionRepository';

const respuestaJson = (estado: number, cuerpo?: unknown) =>
  new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  });

const crearHttp = (respuesta: unknown, estado = 200) => {
  const fetchFalso = vi.fn().mockImplementation(async () => respuestaJson(estado, respuesta));
  const http = new FetchHttpClient({ baseUrl: 'http://api.test', obtenerToken: () => 't', fetch: fetchFalso });
  const llamadas = () => fetchFalso.mock.calls.map(([url, init]) => `${(init as RequestInit).method} ${String(url)}`);
  const cuerpo = (i = 0) => JSON.parse(String((fetchFalso.mock.calls[i]?.[1] as RequestInit).body)) as unknown;
  return { http, llamadas, cuerpo };
};

const ventanaDto = { abre: '2026-08-10T00:00:00.000Z', cierra: '2026-08-16T23:59:59.000Z', estado: 'abierta' };

describe('traducirError', () => {
  it('acepta message como string o string[]', () => {
    expect(traducirError(409, { statusCode: 409, message: 'Ya respondiste' }).mensajes).toEqual(['Ya respondiste']);
    expect(traducirError(400, { statusCode: 400, message: ['a', 'b'], error: 'Bad Request' }).mensajes).toEqual(['a', 'b']);
  });

  it('agrega los detalles (p. ej. un error por fila al importar)', () => {
    const error = traducirError(400, { message: 'La hoja tiene 2 errores', detalles: ['Fila 2: x', 'Fila 3: y'] });
    expect(error.mensajes).toEqual(['La hoja tiene 2 errores', 'Fila 2: x', 'Fila 3: y']);
  });

  it('usa un mensaje en español si el cuerpo no trae message', () => {
    const error = traducirError(403, null);
    expect(error.estado).toBe(403);
    expect(error.message).toMatch(/permiso/);
  });
});

describe('FetchHttpClient', () => {
  it('añade el token, serializa el cuerpo y usa la base URL', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(respuestaJson(200, { ok: true }));
    const http = new FetchHttpClient({ baseUrl: 'http://api.test/', obtenerToken: () => 'abc', fetch: fetchFalso });
    await http.post('/clases', { tema: 'x' });
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/clases');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer abc');
    expect(init.body).toBe('{"tema":"x"}');
  });

  it('omite parámetros vacíos del query string', async () => {
    const fetchFalso = vi.fn().mockImplementation(async () => respuestaJson(200, []));
    const http = new FetchHttpClient({ baseUrl: 'http://api.test', obtenerToken: () => null, fetch: fetchFalso });
    await http.get('/usuarios', { query: { rol: undefined } });
    await http.get('/usuarios', { query: { rol: 'maestro' } });
    expect(fetchFalso.mock.calls.map((c) => c[0])).toEqual(['http://api.test/usuarios', 'http://api.test/usuarios?rol=maestro']);
  });

  it('notifica 401 en peticiones autenticadas pero no en el login', async () => {
    const alNoAutorizado = vi.fn();
    const fetchFalso = vi.fn().mockImplementation(async () => respuestaJson(401, { statusCode: 401, message: 'Unauthorized' }));
    const http = new FetchHttpClient({ baseUrl: 'http://api.test', obtenerToken: () => 'abc', alNoAutorizado, fetch: fetchFalso });

    await expect(http.post('/auth/login', {}, { autenticada: false })).rejects.toBeInstanceOf(ErrorAplicacion);
    expect(alNoAutorizado).not.toHaveBeenCalled();

    await expect(http.get('/grupos/mios')).rejects.toMatchObject({ estado: 401 });
    expect(alNoAutorizado).toHaveBeenCalledTimes(1);
  });

  it('204 devuelve undefined y un fallo de red se traduce', async () => {
    const http204 = new FetchHttpClient({ baseUrl: 'x', obtenerToken: () => null, fetch: vi.fn().mockResolvedValue(new Response(null, { status: 204 })) });
    await expect(http204.delete('/materias/1')).resolves.toBeUndefined();

    const httpCaido = new FetchHttpClient({ baseUrl: 'x', obtenerToken: () => null, fetch: vi.fn().mockRejectedValue(new TypeError('fail')) });
    await expect(httpCaido.get('/a')).rejects.toMatchObject({ estado: 0 });
  });
});

describe('repositorios HTTP', () => {
  it('convierte 404 del contenido semanal en null y elimina con DELETE /clases/:id', async () => {
    const { http } = crearHttp({ statusCode: 404, message: 'No encontrado' }, 404);
    const repo = new HttpContenidoRepository(http);
    await expect(repo.obtenerPorSemana('m1', 2)).resolves.toBeNull();

    const borrar = crearHttp(undefined, 204);
    await new HttpContenidoRepository(borrar.http).eliminar('c1');
    expect(borrar.llamadas()).toEqual(['DELETE http://api.test/clases/c1']);
  });

  it('usa /grupos/mios, /grupos/:id/alumnos y /grupos/:id/calificaciones', async () => {
    const { http, llamadas } = crearHttp([]);
    const repo = new HttpGruposRepository(http);
    await repo.obtenerMios();
    await repo.inscribirAlumnos('g1', ['a1']);
    await repo.darDeBajaAlumno('g1', 'a1');
    await repo.eliminar('g1');
    expect(llamadas()).toEqual([
      'GET http://api.test/grupos/mios',
      'POST http://api.test/grupos/g1/alumnos',
      'DELETE http://api.test/grupos/g1/alumnos/a1',
      'DELETE http://api.test/grupos/g1',
    ]);
    const calificaciones = crearHttp({ materias: [], boletas: [] });
    await expect(new HttpGruposRepository(calificaciones.http).obtenerCalificaciones('g1')).resolves.toEqual({
      materias: [],
      boletas: [],
    });
    expect(calificaciones.llamadas()).toEqual(['GET http://api.test/grupos/g1/calificaciones']);
  });

  it('pide los exámenes de una semana de una materia y responde dentro del grupo', async () => {
    const { http, llamadas, cuerpo } = crearHttp([]);
    const repo = new HttpExamenesGrupoRepository(http);
    await expect(repo.obtenerDeSemana('g1', 'm1', 2)).resolves.toEqual([]);
    await repo.responder('g1', 'e1', [0, 2]);
    expect(llamadas()).toEqual([
      'GET http://api.test/grupos/g1/materias/m1/semanas/2/examenes',
      'POST http://api.test/grupos/g1/examenes/e1/intentos',
    ]);
    expect(cuerpo(1)).toEqual({ respuestas: [0, 2] });
  });

  it('crea, lista e importa los exámenes de la materia', async () => {
    const { http, llamadas, cuerpo } = crearHttp({ _id: 'e9', materia: 'm1', semana: 2, numero: 1, titulo: 'X', diasExtra: 2 });
    const repo = new HttpExamenesRepository(http);
    const examen = await repo.crear({ materiaId: 'm1', semana: 2, numero: 1, titulo: 'X', diasExtra: 2, preguntas: [] });
    expect(examen).toMatchObject({ id: 'e9', semana: 2, numero: 1, diasExtra: 2 });
    expect(cuerpo()).toMatchObject({ semana: 2, numero: 1 });

    const lista = crearHttp([]);
    const repoLista = new HttpExamenesRepository(lista.http);
    await repoLista.listarPorMateria('m1');
    await repoLista.importar('m1', 'semana,examen');
    expect(lista.llamadas()).toEqual([
      'GET http://api.test/examenes/materia/m1',
      'POST http://api.test/examenes/materia/m1/importar',
    ]);
    expect(lista.cuerpo(1)).toEqual({ csv: 'semana,examen' });
    expect(llamadas()).toEqual(['POST http://api.test/examenes']);
  });

  it('usa las rutas de planes, publicación, versiones y bitácora', async () => {
    const plan = { _id: 'p1', nombre: 'Prepa', version: 1, estado: 'publicado' };
    const { http, llamadas } = crearHttp(plan);
    const repo = new HttpPlanesRepository(http);
    await repo.publicar('p1');
    await repo.crearNuevaVersion('p1');
    await repo.actualizar('p1', { descripcion: 'x' });
    expect(llamadas()).toEqual([
      'POST http://api.test/planes/p1/publicar',
      'POST http://api.test/planes/p1/versiones',
      'PATCH http://api.test/planes/p1',
    ]);

    const revision = crearHttp({ listo: false, pendientes: ['Falta algo'] });
    await expect(new HttpPlanesRepository(revision.http).revisar('p1')).resolves.toEqual({ listo: false, pendientes: ['Falta algo'] });
    expect(revision.llamadas()).toEqual(['GET http://api.test/planes/p1/pendientes']);

    const cambios = crearHttp([]);
    await new HttpPlanesRepository(cambios.http).listarCambios('p1');
    expect(cambios.llamadas()).toEqual(['GET http://api.test/planes/p1/cambios']);
  });

  it('las materias del maestro salen de /materias/mias', async () => {
    const { http, llamadas } = crearHttp([]);
    await new HttpMateriasRepository(http).listarMias();
    expect(llamadas()).toEqual(['GET http://api.test/materias/mias']);
  });
});

describe('mappers', () => {
  const planDto = { _id: 'p1', nombre: 'Prepa', version: 2, estado: 'publicado', publicadoEn: '2026-07-01' };

  it('mapea el grupo con su plan, materias y semanas por bloque', () => {
    const grupo = aGrupo({
      _id: 'g1',
      nombre: 'Generación 1',
      fechaInicio: '2026-08-03T06:00:00.000Z',
      plan: planDto,
      materias: [
        { _id: 'm1', plan: 'p1', nombre: 'Mate', bloque: 1, maestro: { _id: 'u2', nombre: 'Carlos', correo: 'c@x.mx' } },
        { _id: 'm2', plan: 'p1', nombre: 'Historia', bloque: 1, maestro: '' },
      ],
      semanaActual: 2,
      semanas: [
        { numero: 1, inicio: 'a', fin: 'b', estado: 'completada', bloque: 1, semanaDeMateria: 1 },
        { numero: 2, inicio: 'c', fin: 'd', estado: 'actual', bloque: 1, semanaDeMateria: 2 },
      ],
    });
    expect(grupo.plan).toEqual({ id: 'p1', nombre: 'Prepa', version: 2, estado: 'publicado', publicadoEn: '2026-07-01' });
    expect(grupo.materias).toEqual([
      { id: 'm1', planId: 'p1', nombre: 'Mate', bloque: 1, maestroId: 'u2', maestro: { id: 'u2', nombre: 'Carlos', correo: 'c@x.mx' } },
      { id: 'm2', planId: 'p1', nombre: 'Historia', bloque: 1 },
    ]);
    expect(grupo.semanas[1]).toMatchObject({ numero: 2, bloque: 1, semanaDeMateria: 2 });
    expect(aUsuario({ _id: 'u1', nombre: 'Ana', correo: 'a@x.mx', rol: 'alumno', grupos: ['g1'] }).grupos).toEqual(['g1']);
  });

  it('mapea el plan con sus materias y la materia del maestro con su plan', () => {
    expect(aPlanDetallado({ ...planDto, materias: [{ _id: 'm1', plan: 'p1', nombre: 'Mate', bloque: 2 }] }).materias).toEqual([
      { id: 'm1', planId: 'p1', nombre: 'Mate', bloque: 2 },
    ]);
    expect(aMateriaEnPlan({ _id: 'm1', plan: planDto, nombre: 'Mate', bloque: 1, maestro: 'u2' })).toMatchObject({
      planId: 'p1',
      maestroId: 'u2',
      plan: { id: 'p1', version: 2 },
    });
  });

  it('mapea la bitácora', () => {
    expect(
      aCambio({ _id: 'c1', entidad: 'examen', entidadId: 'e1', accion: 'actualizar', autor: 'u2', fecha: 'f', antes: { a: 1 } }),
    ).toEqual({ id: 'c1', entidad: 'examen', entidadId: 'e1', accion: 'actualizar', autorId: 'u2', fecha: 'f', antes: { a: 1 } });
  });

  it('mapea la plantilla y el resumen con su materia, ventana e intento', () => {
    const plantilla = aExamen({ _id: 'e1', materia: { _id: 'm1' }, semana: 2, numero: 2, titulo: 'Q', preguntas: [] });
    expect(plantilla).toMatchObject({ id: 'e1', materiaId: 'm1', semana: 2, numero: 2, diasExtra: 0 });

    const resumen = aResumenExamen({
      _id: 'e1',
      materia: { _id: 'm1', nombre: 'Mate' },
      semana: 1,
      numero: 2,
      semanaDelGrupo: 3,
      titulo: 'Q',
      totalPreguntas: 3,
      ventana: ventanaDto,
      miIntento: { aciertos: 2, totalPreguntas: 3, calificacion: 6.67, fecha: '2026-08-11' },
    });
    expect(resumen).toMatchObject({ materia: { id: 'm1', nombre: 'Mate' }, numero: 2, semanaDelGrupo: 3 });
    expect(resumen.ventana).toEqual(ventanaDto);
    expect(resumen.miIntento).toEqual({ aciertos: 2, totalPreguntas: 3, calificacion: 6.67, fecha: '2026-08-11' });

    const raro = aResumenExamen({ _id: 'e2', materia: 'm1', semana: 1, numero: 1, titulo: 'F', ventana: { ...ventanaDto, estado: 'raro' } });
    expect(raro.ventana.estado).toBe('cerrada');
    expect(raro).not.toHaveProperty('miIntento');
  });

  it('conserva los campos de revisión de cada pregunta', () => {
    const examen = aExamenGrupo({
      _id: 'e1',
      materia: 'm1',
      semana: 1,
      numero: 1,
      titulo: 'Q',
      ventana: ventanaDto,
      miIntento: { aciertos: 0, totalPreguntas: 1, calificacion: 0, createdAt: '2026-08-11' },
      preguntas: [{ _id: 'p1', enunciado: 'A', opciones: ['x', 'y'], respuestaCorrecta: 1, miRespuesta: 0, acierto: false }],
    });
    expect(examen.preguntas).toEqual([
      { id: 'p1', enunciado: 'A', opciones: ['x', 'y'], respuestaCorrecta: 1, miRespuesta: 0, acierto: false },
    ]);
    expect(examen.miIntento?.fecha).toBe('2026-08-11');
  });

  it('mapea las calificaciones del grupo', () => {
    const notas = [{ semana: 1, numero: 1, calificacion: 8 }];
    expect(
      aCalificaciones({
        materias: [{ _id: 'm1', nombre: 'Mate', bloque: 1 }],
        boletas: [
          {
            alumno: { _id: 'a1', nombre: 'Ana', correo: 'a@x.mx' },
            materias: [{ materia: 'm1', notas, promedio: 2, aprobada: false, completa: false }],
            promedioGeneral: 2,
          },
        ],
      }),
    ).toEqual({
      materias: [{ id: 'm1', nombre: 'Mate', bloque: 1 }],
      boletas: [
        {
          alumno: { id: 'a1', nombre: 'Ana', correo: 'a@x.mx' },
          materias: [{ materiaId: 'm1', notas, promedio: 2, aprobada: false, completa: false }],
          promedioGeneral: 2,
        },
      ],
    });
  });
});

describe('LocalStorageSesionRepository', () => {
  const sesion = { token: 't', usuario: { id: 'u1', nombre: 'Ana', correo: 'a@a.mx', rol: 'alumno' as const } };

  it('guarda, lee y limpia', () => {
    const repo = new LocalStorageSesionRepository();
    repo.guardar(sesion);
    expect(new LocalStorageSesionRepository().obtener()).toEqual(sesion);
    repo.limpiar();
    expect(repo.obtener()).toBeNull();
  });

  it('ignora datos corruptos', () => {
    window.localStorage.setItem('portal-academico.sesion', '{no json');
    expect(new LocalStorageSesionRepository().obtener()).toBeNull();
  });

  it('funciona en memoria si el almacenamiento lanza', () => {
    const roto = () => {
      throw new Error('bloqueado');
    };
    const repo = new LocalStorageSesionRepository(roto);
    repo.guardar(sesion);
    expect(repo.obtener()).toEqual(sesion);
  });
});

describe('revisión mientras el examen sigue abierto', () => {
  it('no inventa una respuesta correcta si el backend aún no la envía, y conserva la ventana', () => {
    const resultado = aResultadoConRevision({
      aciertos: 1,
      totalPreguntas: 1,
      calificacion: 10,
      fecha: '2026-08-12T15:00:00.000Z',
      ventana: { abre: '2026-08-10T06:00:00.000Z', cierra: '2026-08-17T06:00:00.000Z', estado: 'abierta' },
      revision: [{ _id: 'p1', enunciado: '¿?', opciones: ['a', 'b'], miRespuesta: 0, acierto: true }],
    });
    expect(resultado.revision[0]).not.toHaveProperty('respuestaCorrecta');
    expect(resultado.ventana?.cierra).toBe('2026-08-17T06:00:00.000Z');
  });

  it('marca si la plantilla del examen ya tiene respuestas', () => {
    const examen = aExamen({ _id: 'e1', materia: 'm1', semana: 1, numero: 1, titulo: 'X', preguntas: [], tieneRespuestas: true });
    expect(examen.tieneRespuestas).toBe(true);
  });
});
