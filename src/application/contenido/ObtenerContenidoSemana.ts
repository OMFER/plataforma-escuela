import type { ContenidoSemana } from '../../domain/entities/Contenido';
import type { ContenidoRepository } from '../../domain/repositories/ContenidoRepository';

export class ObtenerContenidoSemana {
  private readonly contenido: ContenidoRepository;

  constructor(contenido: ContenidoRepository) {
    this.contenido = contenido;
  }

  /** null si el maestro aún no publica el contenido. */
  ejecutar(materiaId: string, semana: number): Promise<ContenidoSemana | null> {
    return this.contenido.obtenerPorSemana(materiaId, semana);
  }
}
