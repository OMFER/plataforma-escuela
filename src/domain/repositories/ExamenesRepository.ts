import type { CambiosExamen, Examen, NuevoExamen } from '../entities/Examen';

/** Plantillas de examen de la materia (edición del maestro). */
export interface ExamenesRepository {
  obtenerPorId(id: string): Promise<Examen | null>;
  crear(datos: NuevoExamen): Promise<Examen>;
  actualizar(id: string, cambios: CambiosExamen): Promise<Examen>;
  /** Falla con 409 si es un Semanal que tiene Reposición. */
  eliminar(id: string): Promise<void>;
}
