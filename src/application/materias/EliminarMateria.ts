import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';

export class EliminarMateria {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  /** El backend responde 409 si la materia todavía tiene grupos. */
  ejecutar(id: string): Promise<void> {
    return this.materias.eliminar(id);
  }
}
