import type { CambiosContenidoSemana, ContenidoSemana, NuevoContenidoSemana } from '../entities/Contenido';

export interface ContenidoRepository {
  /** Devuelve null si la semana aún no tiene contenido. */
  obtenerPorSemana(materiaId: string, semana: number): Promise<ContenidoSemana | null>;
  crear(datos: NuevoContenidoSemana): Promise<ContenidoSemana>;
  actualizar(id: string, cambios: CambiosContenidoSemana): Promise<ContenidoSemana>;
}
