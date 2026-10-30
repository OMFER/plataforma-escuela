import type { AuthRepository } from '../domain/repositories/AuthRepository';
import type { ContenidoRepository } from '../domain/repositories/ContenidoRepository';
import type { ExamenesGrupoRepository } from '../domain/repositories/ExamenesGrupoRepository';
import type { ExamenesRepository } from '../domain/repositories/ExamenesRepository';
import type { GruposRepository } from '../domain/repositories/GruposRepository';
import type { MateriasRepository } from '../domain/repositories/MateriasRepository';
import type { SesionRepository } from '../domain/repositories/SesionRepository';
import type { UsuariosRepository } from '../domain/repositories/UsuariosRepository';
import { CerrarSesion } from './auth/CerrarSesion';
import { IniciarSesion } from './auth/IniciarSesion';
import { ObtenerSesionActual } from './auth/ObtenerSesionActual';
import type { CasosDeUso } from './CasosDeUso';
import { EliminarContenidoSemana } from './contenido/EliminarContenidoSemana';
import { GuardarContenidoSemana } from './contenido/GuardarContenidoSemana';
import { ObtenerContenidoSemana } from './contenido/ObtenerContenidoSemana';
import { ActualizarExamen } from './examenes/ActualizarExamen';
import { CrearExamen } from './examenes/CrearExamen';
import { EliminarExamen } from './examenes/EliminarExamen';
import { ObtenerExamen } from './examenes/ObtenerExamen';
import { ListarExamenesGrupo } from './examenesGrupo/ListarExamenesGrupo';
import { ObtenerExamenesSemana } from './examenesGrupo/ObtenerExamenesSemana';
import { ObtenerExamenGrupo } from './examenesGrupo/ObtenerExamenGrupo';
import { ObtenerIntentosExamen } from './examenesGrupo/ObtenerIntentosExamen';
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
import { ListarMaterias } from './materias/ListarMaterias';
import { CrearUsuario } from './usuarios/CrearUsuario';
import { ListarUsuarios } from './usuarios/ListarUsuarios';

/** Puertos que necesitan los casos de uso; cada entorno (app real o tests) aporta sus implementaciones. */
export interface PuertosAplicacion {
  sesiones: SesionRepository;
  auth: AuthRepository;
  usuarios: UsuariosRepository;
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
  listarMaterias: new ListarMaterias(p.materias),
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
  guardarContenidoSemana: new GuardarContenidoSemana(p.contenido),
  eliminarContenidoSemana: new EliminarContenidoSemana(p.contenido),
  obtenerExamen: new ObtenerExamen(p.examenes),
  crearExamen: new CrearExamen(p.examenes),
  actualizarExamen: new ActualizarExamen(p.examenes),
  eliminarExamen: new EliminarExamen(p.examenes),
  listarExamenesGrupo: new ListarExamenesGrupo(p.examenesGrupo),
  obtenerExamenesSemana: new ObtenerExamenesSemana(p.examenesGrupo),
  obtenerExamenGrupo: new ObtenerExamenGrupo(p.examenesGrupo),
  responderExamen: new ResponderExamen(p.examenesGrupo),
  obtenerIntentosExamen: new ObtenerIntentosExamen(p.examenesGrupo),
});
