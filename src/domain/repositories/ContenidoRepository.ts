import type { CambiosContenidoSemana, ContenidoSemana, NuevoContenidoSemana } from '../entities/Contenido';

export interface ContenidoRepository {
  /** Devuelve null si la semana aún no tiene contenido. */
  obtenerPorSemana(materiaId: string, semana: number): Promise<ContenidoSemana | null>;
  listarPorMateria(materiaId: string): Promise<ContenidoSemana[]>;
  /** Solo en un plan en borrador. */
  crear(datos: NuevoContenidoSemana): Promise<ContenidoSemana>;
  /** Una corrección: se permite aunque el plan esté publicado. */
  actualizar(id: string, cambios: CambiosContenidoSemana): Promise<ContenidoSemana>;
  /** Solo en un plan en borrador. */
  eliminar(id: string): Promise<void>;
}
