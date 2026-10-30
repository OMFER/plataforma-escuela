import type { Grupo } from '../../domain/entities/Grupo';
import type { GruposRepository } from '../../domain/repositories/GruposRepository';

export class ObtenerGrupo {
  private readonly grupos: GruposRepository;

  constructor(grupos: GruposRepository) {
    this.grupos = grupos;
  }

  ejecutar(id: string): Promise<Grupo | null> {
    return this.grupos.obtenerPorId(id);
  }
}
