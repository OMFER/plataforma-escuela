import type { CambiosMateria, Materia, NuevaMateria } from '../entities/Materia';

export interface MateriasRepository {
  listar(): Promise<Materia[]>;
  crear(datos: NuevaMateria): Promise<Materia>;
  actualizar(id: string, cambios: CambiosMateria): Promise<Materia>;
  /** Falla con 409 si la materia tiene grupos. */
  eliminar(id: string): Promise<void>;
}
