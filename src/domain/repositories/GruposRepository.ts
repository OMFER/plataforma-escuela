import type { CalificacionesGrupo } from '../entities/Calificaciones';
import type { Grupo, NuevoGrupo } from '../entities/Grupo';
import type { Usuario } from '../entities/Usuario';

export interface GruposRepository {
  /** Alumno: donde está inscrito; maestro: los que cursan un plan con sus materias; admin: todos. */
  obtenerMios(): Promise<Grupo[]>;
  listar(): Promise<Grupo[]>;
  obtenerPorId(id: string): Promise<Grupo | null>;
  /** Solo con un plan publicado y empezando en lunes. */
  crear(datos: NuevoGrupo): Promise<Grupo>;
  /** Borra también inscripciones e intentos; el plan se conserva. */
  eliminar(id: string): Promise<void>;
  listarAlumnos(grupoId: string): Promise<Usuario[]>;
  inscribirAlumnos(grupoId: string, alumnoIds: string[]): Promise<Usuario[]>;
  darDeBajaAlumno(grupoId: string, alumnoId: string): Promise<void>;
  obtenerCalificaciones(grupoId: string): Promise<CalificacionesGrupo>;
}
