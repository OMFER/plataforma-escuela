import type { Materia, NuevaMateria } from '../entities/Materia';
import type { Usuario } from '../entities/Usuario';

export interface MateriasRepository {
  obtenerMias(): Promise<Materia[]>;
  obtenerPorId(id: string): Promise<Materia | null>;
  listar(): Promise<Materia[]>;
  crear(datos: NuevaMateria): Promise<Materia>;
  listarAlumnos(materiaId: string): Promise<Usuario[]>;
  inscribirAlumnos(materiaId: string, alumnoIds: string[]): Promise<Usuario[]>;
  darDeBajaAlumno(materiaId: string, alumnoId: string): Promise<void>;
}
