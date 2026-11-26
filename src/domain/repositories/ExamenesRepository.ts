import type { CambiosExamen, Examen, NuevoExamen } from '../entities/Examen';

/** Exámenes de la materia, con sus respuestas (edición del maestro asignado o del admin). */
export interface ExamenesRepository {
  obtenerPorId(id: string): Promise<Examen | null>;
  listarPorMateria(materiaId: string): Promise<Examen[]>;
  /** Solo en un plan en borrador. */
  crear(datos: NuevoExamen): Promise<Examen>;
  actualizar(id: string, cambios: CambiosExamen): Promise<Examen>;
  /** Solo en un plan en borrador. */
  eliminar(id: string): Promise<void>;
  /** Importa el CSV de la plantilla; si tiene errores no guarda nada y los devuelve por fila. */
  importar(materiaId: string, csv: string): Promise<Examen[]>;
}
