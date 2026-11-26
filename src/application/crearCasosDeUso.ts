import type { AuthRepository } from '../domain/repositories/AuthRepository';
import type { ContenidoRepository } from '../domain/repositories/ContenidoRepository';
import type { ExamenesGrupoRepository } from '../domain/repositories/ExamenesGrupoRepository';
import type { ExamenesRepository } from '../domain/repositories/ExamenesRepository';
import type { GruposRepository } from '../domain/repositories/GruposRepository';
import type { MateriasRepository } from '../domain/repositories/MateriasRepository';
import type { PlanesRepository } from '../domain/repositories/PlanesRepository';
import type { SesionRepository } from '../domain/repositories/SesionRepository';
import type { UsuariosRepository } from '../domain/repositories/UsuariosRepository';
import { CerrarSesion } from './auth/CerrarSesion';
import { IniciarSesion } from './auth/IniciarSesion';
import { ObtenerSesionActual } from './auth/ObtenerSesionActual';
import type { CasosDeUso } from './CasosDeUso';
import { EliminarContenidoSemana } from './contenido/EliminarContenidoSemana';
import { GuardarContenidoSemana } from './contenido/GuardarContenidoSemana';
import { ListarContenidoMateria } from './contenido/ListarContenidoMateria';
import { ObtenerContenidoSemana } from './contenido/ObtenerContenidoSemana';
import { ActualizarExamen } from './examenes/ActualizarExamen';
import { CrearExamen } from './examenes/CrearExamen';
import { EliminarExamen } from './examenes/EliminarExamen';
import { ImportarExamenes } from './examenes/ImportarExamenes';
import { ListarExamenesMateria } from './examenes/ListarExamenesMateria';
import { ObtenerExamen } from './examenes/ObtenerExamen';
import { ListarExamenesGrupo } from './examenesGrupo/ListarExamenesGrupo';
import { ObtenerExamenesSemana } from './examenesGrupo/ObtenerExamenesSemana';
import { ObtenerExamenGrupo } from './examenesGrupo/ObtenerExamenGrupo';
import { ResponderExamen } from './examenesGrupo/ResponderExamen';
import { CrearGrupo } from './grupos/CrearGrupo';
import { DarDeBajaAlumno } from './grupos/DarDeBajaAlumno';
import { EliminarGrupo } from './grupos/EliminarGrupo';
import { InscribirAlumnos } from './grupos/InscribirAlumnos';
import { ListarGrupos } from './grupos/ListarGrupos';
import { ObtenerAlumnosGrupo } from './grupos/ObtenerAlumnosGrupo';
import { ObtenerCalificaciones } from './grupos/ObtenerCalificaciones';
import { ObtenerGrupo } from './grupos/ObtenerGrupo';
import { ObtenerMisGrupos } from './grupos/ObtenerMisGrupos';
import { ActualizarMateria } from './materias/ActualizarMateria';
import { CrearMateria } from './materias/CrearMateria';
import { EliminarMateria } from './materias/EliminarMateria';
import { ListarMisMaterias } from './materias/ListarMisMaterias';
import { ObtenerMateria } from './materias/ObtenerMateria';
import { ActualizarPlan } from './planes/ActualizarPlan';
import { CrearNuevaVersion } from './planes/CrearNuevaVersion';
import { CrearPlan } from './planes/CrearPlan';
import { EliminarPlan } from './planes/EliminarPlan';
import { ListarCambiosPlan } from './planes/ListarCambiosPlan';
import { ListarPlanes } from './planes/ListarPlanes';
import { ObtenerPlan } from './planes/ObtenerPlan';
import { PublicarPlan } from './planes/PublicarPlan';
import { RevisarPlan } from './planes/RevisarPlan';
import { CrearUsuario } from './usuarios/CrearUsuario';
import { ListarUsuarios } from './usuarios/ListarUsuarios';

/** Puertos que necesitan los casos de uso; cada entorno (app real o tests) aporta sus implementaciones. */
export interface PuertosAplicacion {
  sesiones: SesionRepository;
  auth: AuthRepository;
  usuarios: UsuariosRepository;
  planes: PlanesRepository;
  materias: MateriasRepository;
  grupos: GruposRepository;
  contenido: ContenidoRepository;
  examenes: ExamenesRepository;
  examenesGrupo: ExamenesGrupoRepository;
}

export const crearCasosDeUso = (p: PuertosAplicacion): CasosDeUso => ({
  iniciarSesion: new IniciarSesion(p.auth, p.sesiones),
  cerrarSesion: new CerrarSesion(p.sesiones),
  obtenerSesionActual: new ObtenerSesionActual(p.sesiones),
  listarUsuarios: new ListarUsuarios(p.usuarios),
  crearUsuario: new CrearUsuario(p.usuarios),
  listarPlanes: new ListarPlanes(p.planes),
  obtenerPlan: new ObtenerPlan(p.planes),
  crearPlan: new CrearPlan(p.planes),
  actualizarPlan: new ActualizarPlan(p.planes),
  eliminarPlan: new EliminarPlan(p.planes),
  revisarPlan: new RevisarPlan(p.planes),
  publicarPlan: new PublicarPlan(p.planes),
  crearNuevaVersion: new CrearNuevaVersion(p.planes),
  listarCambiosPlan: new ListarCambiosPlan(p.planes),
  listarMisMaterias: new ListarMisMaterias(p.materias),
  obtenerMateria: new ObtenerMateria(p.materias),
  crearMateria: new CrearMateria(p.materias),
  actualizarMateria: new ActualizarMateria(p.materias),
  eliminarMateria: new EliminarMateria(p.materias),
  obtenerMisGrupos: new ObtenerMisGrupos(p.grupos),
  obtenerGrupo: new ObtenerGrupo(p.grupos),
  listarGrupos: new ListarGrupos(p.grupos),
  crearGrupo: new CrearGrupo(p.grupos),
  eliminarGrupo: new EliminarGrupo(p.grupos),
  obtenerAlumnosGrupo: new ObtenerAlumnosGrupo(p.grupos),
  inscribirAlumnos: new InscribirAlumnos(p.grupos),
  darDeBajaAlumno: new DarDeBajaAlumno(p.grupos),
  obtenerCalificaciones: new ObtenerCalificaciones(p.grupos),
  obtenerContenidoSemana: new ObtenerContenidoSemana(p.contenido),
  listarContenidoMateria: new ListarContenidoMateria(p.contenido),
  guardarContenidoSemana: new GuardarContenidoSemana(p.contenido),
  eliminarContenidoSemana: new EliminarContenidoSemana(p.contenido),
  obtenerExamen: new ObtenerExamen(p.examenes),
  listarExamenesMateria: new ListarExamenesMateria(p.examenes),
  crearExamen: new CrearExamen(p.examenes),
  actualizarExamen: new ActualizarExamen(p.examenes),
  eliminarExamen: new EliminarExamen(p.examenes),
  importarExamenes: new ImportarExamenes(p.examenes),
  listarExamenesGrupo: new ListarExamenesGrupo(p.examenesGrupo),
  obtenerExamenesSemana: new ObtenerExamenesSemana(p.examenesGrupo),
  obtenerExamenGrupo: new ObtenerExamenGrupo(p.examenesGrupo),
  responderExamen: new ResponderExamen(p.examenesGrupo),
});
