import type { ContenidoSemana } from '../../domain/entities/Contenido';
import type { ContenidoRepository } from '../../domain/repositories/ContenidoRepository';

export class ListarContenidoMateria {
  private readonly contenido: ContenidoRepository;

  constructor(contenido: ContenidoRepository) {
    this.contenido = contenido;
  }

  /** El contenido de las semanas de la materia, en orden. */
  async ejecutar(materiaId: string): Promise<ContenidoSemana[]> {
    return (await this.contenido.listarPorMateria(materiaId)).sort((a, b) => a.semana - b.semana);
  }
}
