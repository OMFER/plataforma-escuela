import type { CalificacionesAlumno } from '../entities/Calificaciones';
import type { Grupo, NuevoGrupo } from '../entities/Grupo';
import type { Usuario } from '../entities/Usuario';

export interface GruposRepository {
  /** Alumno: donde está inscrito; maestro: los que imparte; admin: todos. */
  obtenerMios(): Promise<Grupo[]>;
  listar(): Promise<Grupo[]>;
  obtenerPorId(id: string): Promise<Grupo | null>;
  crear(datos: NuevoGrupo): Promise<Grupo>;
  /** Borra también inscripciones e intentos; la materia se conserva. */
  eliminar(id: string): Promise<void>;
  listarAlumnos(grupoId: string): Promise<Usuario[]>;
  inscribirAlumnos(grupoId: string, alumnoIds: string[]): Promise<Usuario[]>;
  darDeBajaAlumno(grupoId: string, alumnoId: string): Promise<void>;
  /** Alumno: solo él; maestro/admin: todos los inscritos. */
  obtenerCalificaciones(grupoId: string): Promise<CalificacionesAlumno[]>;
}
