import { describe, expect, it, vi } from 'vitest';
import { ErrorAplicacion } from '../domain/errors/ErrorAplicacion';
import { FetchHttpClient, traducirError } from './http/FetchHttpClient';
import { aCalificaciones, aExamen, aExamenGrupo, aGrupo, aIntento, aResumenExamen, aUsuario } from './mappers/mappers';
import { HttpContenidoRepository } from './repositories/HttpContenidoRepository';
import { HttpExamenesGrupoRepository } from './repositories/HttpExamenesGrupoRepository';
import { HttpExamenesRepository } from './repositories/HttpExamenesRepository';
import { HttpGruposRepository } from './repositories/HttpGruposRepository';
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
    await repo.obtenerCalificaciones('g1');
    await repo.eliminar('g1');
    expect(llamadas()).toEqual([
      'GET http://api.test/grupos/mios',
      'POST http://api.test/grupos/g1/alumnos',
      'DELETE http://api.test/grupos/g1/alumnos/a1',
      'GET http://api.test/grupos/g1/calificaciones',
      'DELETE http://api.test/grupos/g1',
    ]);
  });

  it('responde y consulta exámenes dentro del grupo', async () => {
    const { http, llamadas, cuerpo } = crearHttp({ semanal: null, reposicion: null });
    const repo = new HttpExamenesGrupoRepository(http);
    await expect(repo.obtenerPorSemana('g1', 3)).resolves.toEqual({ semanal: null, reposicion: null });
    await repo.responder('g1', 'e1', [0, 2]);
    expect(llamadas()).toEqual([
      'GET http://api.test/grupos/g1/examenes/semana/3',
      'POST http://api.test/grupos/g1/examenes/e1/intentos',
    ]);
    expect(cuerpo(1)).toEqual({ respuestas: [0, 2] });

    const intentos = crearHttp([]);
    await new HttpExamenesGrupoRepository(intentos.http).obtenerIntentos('g1', 'e1');
    expect(intentos.llamadas()).toEqual(['GET http://api.test/grupos/g1/examenes/e1/intentos']);
  });

  it('crea la plantilla del Final sin semana y elimina por id', async () => {
    const { http, llamadas, cuerpo } = crearHttp({ _id: 'e9', materia: 'm1', tipo: 'Final', titulo: 'Final', diasExtra: 2 });
    const repo = new HttpExamenesRepository(http);
    const examen = await repo.crear({ materiaId: 'm1', tipo: 'Final', titulo: 'Final', diasExtra: 2, preguntas: [] });
    await repo.eliminar('e9');
    expect(examen).toMatchObject({ id: 'e9', tipo: 'Final', diasExtra: 2 });
    expect(examen).not.toHaveProperty('semana');
    expect(cuerpo()).not.toHaveProperty('semana');
    expect(llamadas()).toEqual(['POST http://api.test/examenes', 'DELETE http://api.test/examenes/e9']);
  });
});

describe('mappers', () => {
  it('mapea el grupo con su materia y maestro poblados', () => {
    const grupo = aGrupo({
      _id: 'g1',
      nombre: '05',
      periodo: '2026-B',
      fechaInicio: '2026-08-03',
      materia: { _id: 'm1', nombre: 'Ética', totalSemanas: 16 },
      maestro: { _id: 'u2', nombre: 'Carlos', correo: 'c@x.mx' },
    });
    expect(grupo).toMatchObject({
      id: 'g1',
      periodo: '2026-B',
      materia: { id: 'm1', nombre: 'Ética', totalSemanas: 16 },
      maestro: { id: 'u2', nombre: 'Carlos', correo: 'c@x.mx' },
      semanaActual: 0,
      semanas: [],
    });
    expect(aUsuario({ _id: 'u1', nombre: 'Ana', correo: 'a@x.mx', rol: 'alumno', grupos: ['g1'] }).grupos).toEqual(['g1']);
  });

  it('mapea la plantilla, el resumen con ventana y el intento del alumno', () => {
    const plantilla = aExamen({ _id: 'e1', materia: { _id: 'm1' }, tipo: 'Reposicion', semana: 2, titulo: 'Q', preguntas: [] });
    expect(plantilla).toMatchObject({ id: 'e1', materiaId: 'm1', tipo: 'Reposicion', semana: 2, puntajeMaximo: 100, diasExtra: 0 });

    const resumen = aResumenExamen({
      _id: 'e1',
      tipo: 'Semanal',
      semana: 1,
      titulo: 'Q',
      totalPreguntas: 3,
      ventana: ventanaDto,
      miIntento: { aciertos: 2, totalPreguntas: 3, calificacion: 66.7, fecha: '2026-08-11' },
    });
    expect(resumen.ventana).toEqual(ventanaDto);
    expect(resumen.miIntento).toEqual({ aciertos: 2, totalPreguntas: 3, calificacion: 66.7, fecha: '2026-08-11' });

    const final = aResumenExamen({ _id: 'e2', tipo: 'Final', semana: null, titulo: 'F', ventana: { ...ventanaDto, estado: 'raro' } });
    expect(final).not.toHaveProperty('semana');
    expect(final.ventana.estado).toBe('cerrada');
    expect(final).not.toHaveProperty('miIntento');
  });

  it('conserva los campos de revisión de cada pregunta', () => {
    const examen = aExamenGrupo({
      _id: 'e1',
      tipo: 'Semanal',
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

  it('mapea calificaciones e intentos', () => {
    const nota = { calificacion: 8, puntajeMaximo: 10 };
    expect(
      aCalificaciones({
        alumno: { _id: 'a1', nombre: 'Ana', correo: 'a@x.mx' },
        semanas: [{ semana: 1, semanal: nota, reposicion: null, mejor: nota }],
        final: null,
      }),
    ).toEqual({
      alumno: { id: 'a1', nombre: 'Ana', correo: 'a@x.mx' },
      semanas: [{ semana: 1, semanal: nota, reposicion: null, mejor: nota }],
      final: null,
    });
    expect(
      aIntento({
        _id: 'i1',
        examen: 'e1',
        alumno: { _id: 'a1', nombre: 'Ana' },
        respuestas: [1],
        aciertos: 1,
        totalPreguntas: 1,
        calificacion: 10,
        createdAt: '2026-08-11',
      }),
    ).toMatchObject({ id: 'i1', examenId: 'e1', alumno: { id: 'a1', nombre: 'Ana', correo: '' }, fecha: '2026-08-11' });
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
