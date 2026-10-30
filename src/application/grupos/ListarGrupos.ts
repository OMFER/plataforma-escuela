import type { Grupo } from '../../domain/entities/Grupo';
import type { GruposRepository } from '../../domain/repositories/GruposRepository';

export class ListarGrupos {
  private readonly grupos: GruposRepository;

  constructor(grupos: GruposRepository) {
    this.grupos = grupos;
  }

  ejecutar(): Promise<Grupo[]> {
    return this.grupos.listar();
  }
}
