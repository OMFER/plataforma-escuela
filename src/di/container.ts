import { CerrarSesion } from '../application/auth/CerrarSesion';
import { IniciarSesion } from '../application/auth/IniciarSesion';
import { ObtenerSesionActual } from '../application/auth/ObtenerSesionActual';
import type { Dependencias } from '../application/CasosDeUso';
import { GuardarContenidoSemana } from '../application/contenido/GuardarContenidoSemana';
import { ObtenerContenidoSemana } from '../application/contenido/ObtenerContenidoSemana';
import { ActualizarExamen } from '../application/examenes/ActualizarExamen';
import { CrearExamen } from '../application/examenes/CrearExamen';
import { ObtenerExamen } from '../application/examenes/ObtenerExamen';
import { ObtenerExamenSemana } from '../application/examenes/ObtenerExamenSemana';
import { ObtenerIntentosExamen } from '../application/examenes/ObtenerIntentosExamen';
import { ResponderExamen } from '../application/examenes/ResponderExamen';
import { CrearMateria } from '../application/materias/CrearMateria';
import { DarDeBajaAlumno } from '../application/materias/DarDeBajaAlumno';
import { InscribirAlumnos } from '../application/materias/InscribirAlumnos';
import { ListarMaterias } from '../application/materias/ListarMaterias';
import { ObtenerAlumnosMateria } from '../application/materias/ObtenerAlumnosMateria';
import { ObtenerMateria } from '../application/materias/ObtenerMateria';
import { ObtenerMisMaterias } from '../application/materias/ObtenerMisMaterias';
import { CrearUsuario } from '../application/usuarios/CrearUsuario';
import { ListarUsuarios } from '../application/usuarios/ListarUsuarios';
import { obtenerUrlApi } from '../infrastructure/config';
import { FetchHttpClient } from '../infrastructure/http/FetchHttpClient';
import { HttpAuthRepository } from '../infrastructure/repositories/HttpAuthRepository';
import { HttpContenidoRepository } from '../infrastructure/repositories/HttpContenidoRepository';
import { HttpExamenesRepository } from '../infrastructure/repositories/HttpExamenesRepository';
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

  const auth = new HttpAuthRepository(http);
  const usuarios = new HttpUsuariosRepository(http);
  const materias = new HttpMateriasRepository(http);
  const contenido = new HttpContenidoRepository(http);
  const examenes = new HttpExamenesRepository(http);

  return {
    casosDeUso: {
      iniciarSesion: new IniciarSesion(auth, sesiones),
      cerrarSesion: new CerrarSesion(sesiones),
      obtenerSesionActual: new ObtenerSesionActual(sesiones),
      listarUsuarios: new ListarUsuarios(usuarios),
      crearUsuario: new CrearUsuario(usuarios),
      obtenerMisMaterias: new ObtenerMisMaterias(materias),
      obtenerMateria: new ObtenerMateria(materias),
      listarMaterias: new ListarMaterias(materias),
      crearMateria: new CrearMateria(materias),
      obtenerAlumnosMateria: new ObtenerAlumnosMateria(materias),
      inscribirAlumnos: new InscribirAlumnos(materias),
      darDeBajaAlumno: new DarDeBajaAlumno(materias),
      obtenerContenidoSemana: new ObtenerContenidoSemana(contenido),
      guardarContenidoSemana: new GuardarContenidoSemana(contenido),
      obtenerExamenSemana: new ObtenerExamenSemana(examenes),
      obtenerExamen: new ObtenerExamen(examenes),
      responderExamen: new ResponderExamen(examenes),
      crearExamen: new CrearExamen(examenes),
      actualizarExamen: new ActualizarExamen(examenes),
      obtenerIntentosExamen: new ObtenerIntentosExamen(examenes),
    },
    eventosSesion: {
      alExpirar: (oyente) => {
        oyentesExpiracion.add(oyente);
        return () => oyentesExpiracion.delete(oyente);
      },
    },
  };
};
