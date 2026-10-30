import type { CerrarSesion } from './auth/CerrarSesion';
import type { IniciarSesion } from './auth/IniciarSesion';
import type { ObtenerSesionActual } from './auth/ObtenerSesionActual';
import type { GuardarContenidoSemana } from './contenido/GuardarContenidoSemana';
import type { ObtenerContenidoSemana } from './contenido/ObtenerContenidoSemana';
import type { ActualizarExamen } from './examenes/ActualizarExamen';
import type { CrearExamen } from './examenes/CrearExamen';
import type { ObtenerExamen } from './examenes/ObtenerExamen';
import type { ObtenerExamenSemana } from './examenes/ObtenerExamenSemana';
import type { ObtenerIntentosExamen } from './examenes/ObtenerIntentosExamen';
import type { ResponderExamen } from './examenes/ResponderExamen';
import type { CrearMateria } from './materias/CrearMateria';
import type { DarDeBajaAlumno } from './materias/DarDeBajaAlumno';
import type { InscribirAlumnos } from './materias/InscribirAlumnos';
import type { ListarMaterias } from './materias/ListarMaterias';
import type { ObtenerAlumnosMateria } from './materias/ObtenerAlumnosMateria';
import type { ObtenerMateria } from './materias/ObtenerMateria';
import type { ObtenerMisMaterias } from './materias/ObtenerMisMaterias';
import type { CrearUsuario } from './usuarios/CrearUsuario';
import type { ListarUsuarios } from './usuarios/ListarUsuarios';

/** Solo la API pública (`ejecutar`) de cada caso de uso: facilita sustituirlos en tests. */
type Publico<T> = Pick<T, keyof T>;

/** Contrato que consume la capa de presentación (se arma en el composition root). */
export interface CasosDeUso {
  iniciarSesion: Publico<IniciarSesion>;
  cerrarSesion: Publico<CerrarSesion>;
  obtenerSesionActual: Publico<ObtenerSesionActual>;
  listarUsuarios: Publico<ListarUsuarios>;
  crearUsuario: Publico<CrearUsuario>;
  obtenerMisMaterias: Publico<ObtenerMisMaterias>;
  obtenerMateria: Publico<ObtenerMateria>;
  listarMaterias: Publico<ListarMaterias>;
  crearMateria: Publico<CrearMateria>;
  obtenerAlumnosMateria: Publico<ObtenerAlumnosMateria>;
  inscribirAlumnos: Publico<InscribirAlumnos>;
  darDeBajaAlumno: Publico<DarDeBajaAlumno>;
  obtenerContenidoSemana: Publico<ObtenerContenidoSemana>;
  guardarContenidoSemana: Publico<GuardarContenidoSemana>;
  obtenerExamenSemana: Publico<ObtenerExamenSemana>;
  obtenerExamen: Publico<ObtenerExamen>;
  responderExamen: Publico<ResponderExamen>;
  crearExamen: Publico<CrearExamen>;
  actualizarExamen: Publico<ActualizarExamen>;
  obtenerIntentosExamen: Publico<ObtenerIntentosExamen>;
}

/** Permite a la presentación reaccionar cuando el servidor invalida la sesión (401). */
export interface EventosSesion {
  /** Registra un oyente; devuelve la función para quitarlo. */
  alExpirar(oyente: () => void): () => void;
}

export interface Dependencias {
  casosDeUso: CasosDeUso;
  eventosSesion: EventosSesion;
}
