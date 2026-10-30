import type { ContenidoRepository } from '../../domain/repositories/ContenidoRepository';

export class EliminarContenidoSemana {
  private readonly contenido: ContenidoRepository;

  constructor(contenido: ContenidoRepository) {
    this.contenido = contenido;
  }

  ejecutar(id: string): Promise<void> {
    return this.contenido.eliminar(id);
  }
}
