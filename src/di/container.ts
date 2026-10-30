import type { Dependencias } from '../application/CasosDeUso';
import { crearCasosDeUso } from '../application/crearCasosDeUso';
import { obtenerUrlApi } from '../infrastructure/config';
import { FetchHttpClient } from '../infrastructure/http/FetchHttpClient';
import { HttpAuthRepository } from '../infrastructure/repositories/HttpAuthRepository';
import { HttpContenidoRepository } from '../infrastructure/repositories/HttpContenidoRepository';
import { HttpExamenesGrupoRepository } from '../infrastructure/repositories/HttpExamenesGrupoRepository';
import { HttpExamenesRepository } from '../infrastructure/repositories/HttpExamenesRepository';
import { HttpGruposRepository } from '../infrastructure/repositories/HttpGruposRepository';
import { HttpMateriasRepository } from '../infrastructure/repositories/HttpMateriasRepository';
import { HttpUsuariosRepository } from '../infrastructure/repositories/HttpUsuariosRepository';
import { LocalStorageSesionRepository } from '../infrastructure/storage/LocalStorageSesionRepository';

/** Composition root: único lugar donde se conectan implementaciones concretas con los casos de uso. */
export const crearContenedor = (baseUrl: string = obtenerUrlApi()): Dependencias => {
  const sesiones = new LocalStorageSesionRepository();
  const oyentesExpiracion = new Set<() => void>();

  const http = new FetchHttpClient({
    baseUrl,
    obtenerToken: () => sesiones.obtener()?.token ?? null,
    alNoAutorizado: () => {
      sesiones.limpiar();
      oyentesExpiracion.forEach((oyente) => oyente());
    },
  });

  return {
    casosDeUso: crearCasosDeUso({
      sesiones,
      auth: new HttpAuthRepository(http),
      usuarios: new HttpUsuariosRepository(http),
      materias: new HttpMateriasRepository(http),
      grupos: new HttpGruposRepository(http),
      contenido: new HttpContenidoRepository(http),
      examenes: new HttpExamenesRepository(http),
      examenesGrupo: new HttpExamenesGrupoRepository(http),
    }),
    eventosSesion: {
      alExpirar: (oyente) => {
        oyentesExpiracion.add(oyente);
        return () => oyentesExpiracion.delete(oyente);
      },
    },
  };
};
