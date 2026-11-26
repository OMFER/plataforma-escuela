import type { CerrarSesion } from './auth/CerrarSesion';
import type { IniciarSesion } from './auth/IniciarSesion';
import type { ObtenerSesionActual } from './auth/ObtenerSesionActual';
import type { EliminarContenidoSemana } from './contenido/EliminarContenidoSemana';
import type { GuardarContenidoSemana } from './contenido/GuardarContenidoSemana';
import type { ListarContenidoMateria } from './contenido/ListarContenidoMateria';
import type { ObtenerContenidoSemana } from './contenido/ObtenerContenidoSemana';
import type { ActualizarExamen } from './examenes/ActualizarExamen';
import type { CrearExamen } from './examenes/CrearExamen';
import type { EliminarExamen } from './examenes/EliminarExamen';
import type { ImportarExamenes } from './examenes/ImportarExamenes';
import type { ListarExamenesMateria } from './examenes/ListarExamenesMateria';
import type { ObtenerExamen } from './examenes/ObtenerExamen';
import type { ListarExamenesGrupo } from './examenesGrupo/ListarExamenesGrupo';
import type { ObtenerExamenesSemana } from './examenesGrupo/ObtenerExamenesSemana';
import type { ObtenerExamenGrupo } from './examenesGrupo/ObtenerExamenGrupo';
import type { ResponderExamen } from './examenesGrupo/ResponderExamen';
import type { CrearGrupo } from './grupos/CrearGrupo';
import type { DarDeBajaAlumno } from './grupos/DarDeBajaAlumno';
import type { EliminarGrupo } from './grupos/EliminarGrupo';
import type { InscribirAlumnos } from './grupos/InscribirAlumnos';
import type { ListarGrupos } from './grupos/ListarGrupos';
import type { ObtenerAlumnosGrupo } from './grupos/ObtenerAlumnosGrupo';
import type { ObtenerCalificaciones } from './grupos/ObtenerCalificaciones';
import type { ObtenerGrupo } from './grupos/ObtenerGrupo';
import type { ObtenerMisGrupos } from './grupos/ObtenerMisGrupos';
import type { ActualizarMateria } from './materias/ActualizarMateria';
import type { CrearMateria } from './materias/CrearMateria';
import type { EliminarMateria } from './materias/EliminarMateria';
import type { ListarMisMaterias } from './materias/ListarMisMaterias';
import type { ObtenerMateria } from './materias/ObtenerMateria';
import type { ActualizarPlan } from './planes/ActualizarPlan';
import type { CrearNuevaVersion } from './planes/CrearNuevaVersion';
import type { CrearPlan } from './planes/CrearPlan';
import type { EliminarPlan } from './planes/EliminarPlan';
import type { ListarCambiosPlan } from './planes/ListarCambiosPlan';
import type { ListarPlanes } from './planes/ListarPlanes';
import type { ObtenerPlan } from './planes/ObtenerPlan';
import type { PublicarPlan } from './planes/PublicarPlan';
import type { RevisarPlan } from './planes/RevisarPlan';
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
  listarPlanes: Publico<ListarPlanes>;
  obtenerPlan: Publico<ObtenerPlan>;
  crearPlan: Publico<CrearPlan>;
  actualizarPlan: Publico<ActualizarPlan>;
  eliminarPlan: Publico<EliminarPlan>;
  revisarPlan: Publico<RevisarPlan>;
  publicarPlan: Publico<PublicarPlan>;
  crearNuevaVersion: Publico<CrearNuevaVersion>;
  listarCambiosPlan: Publico<ListarCambiosPlan>;
  listarMisMaterias: Publico<ListarMisMaterias>;
  obtenerMateria: Publico<ObtenerMateria>;
  crearMateria: Publico<CrearMateria>;
  actualizarMateria: Publico<ActualizarMateria>;
  eliminarMateria: Publico<EliminarMateria>;
  obtenerMisGrupos: Publico<ObtenerMisGrupos>;
  obtenerGrupo: Publico<ObtenerGrupo>;
  listarGrupos: Publico<ListarGrupos>;
  crearGrupo: Publico<CrearGrupo>;
  eliminarGrupo: Publico<EliminarGrupo>;
  obtenerAlumnosGrupo: Publico<ObtenerAlumnosGrupo>;
  inscribirAlumnos: Publico<InscribirAlumnos>;
  darDeBajaAlumno: Publico<DarDeBajaAlumno>;
  obtenerCalificaciones: Publico<ObtenerCalificaciones>;
  obtenerContenidoSemana: Publico<ObtenerContenidoSemana>;
  listarContenidoMateria: Publico<ListarContenidoMateria>;
  guardarContenidoSemana: Publico<GuardarContenidoSemana>;
  eliminarContenidoSemana: Publico<EliminarContenidoSemana>;
  obtenerExamen: Publico<ObtenerExamen>;
  listarExamenesMateria: Publico<ListarExamenesMateria>;
  crearExamen: Publico<CrearExamen>;
  actualizarExamen: Publico<ActualizarExamen>;
  eliminarExamen: Publico<EliminarExamen>;
  importarExamenes: Publico<ImportarExamenes>;
  listarExamenesGrupo: Publico<ListarExamenesGrupo>;
  obtenerExamenesSemana: Publico<ObtenerExamenesSemana>;
  obtenerExamenGrupo: Publico<ObtenerExamenGrupo>;
  responderExamen: Publico<ResponderExamen>;
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
