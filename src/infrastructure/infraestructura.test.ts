import { describe, expect, it, vi } from 'vitest';
import { ErrorAplicacion } from '../domain/errors/ErrorAplicacion';
import { FetchHttpClient, traducirError } from './http/FetchHttpClient';
import { aExamen, aMateria } from './mappers/mappers';
import { HttpContenidoRepository } from './repositories/HttpContenidoRepository';
import { LocalStorageSesionRepository } from './storage/LocalStorageSesionRepository';

const respuestaJson = (estado: number, cuerpo?: unknown) =>
  new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  });

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

    await expect(http.get('/materias/mias')).rejects.toMatchObject({ estado: 401 });
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
  it('convierte 404 del contenido semanal en null', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(respuestaJson(404, { statusCode: 404, message: 'No encontrado' }));
    const repo = new HttpContenidoRepository(new FetchHttpClient({ baseUrl: 'x', obtenerToken: () => 't', fetch: fetchFalso }));
    await expect(repo.obtenerPorSemana('m1', 2)).resolves.toBeNull();
  });
});

describe('mappers', () => {
  it('mapea _id e ids de referencias pobladas', () => {
    const materia = aMateria({
      _id: 'm1',
      nombre: 'Ética',
      maestro: { _id: 'u2', nombre: 'Carlos' },
      fechaInicio: '2026-08-03',
      totalSemanas: 16,
    });
    expect(materia).toMatchObject({ id: 'm1', maestro: { id: 'u2', nombre: 'Carlos' }, semanaActual: 0, semanas: [] });

    const examen = aExamen({ _id: 'e1', materia: { _id: 'm1' }, titulo: 'Q', miIntento: null, preguntas: [] });
    expect(examen).toMatchObject({ id: 'e1', materiaId: 'm1', puntajeMaximo: 100, tipo: 'Semanal', miIntento: null });
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
