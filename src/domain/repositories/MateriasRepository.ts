import type { CambiosMateria, Materia, MateriaEnPlan, NuevaMateria } from '../entities/Materia';

export interface MateriasRepository {
  /** Las materias asignadas al maestro de la sesión, con su versión del plan. */
  listarMias(): Promise<MateriaEnPlan[]>;
  obtener(id: string): Promise<MateriaEnPlan | null>;
  /** Solo en un plan en borrador. */
  crear(datos: NuevaMateria): Promise<Materia>;
  /** Cambiar de bloque solo en borrador; nombre, descripción y maestro siempre. */
  actualizar(id: string, cambios: CambiosMateria): Promise<Materia>;
  /** Solo en un plan en borrador; se lleva su contenido y exámenes. */
  eliminar(id: string): Promise<void>;
}
