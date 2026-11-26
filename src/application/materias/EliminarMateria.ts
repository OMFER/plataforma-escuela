import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';

export class EliminarMateria {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  /** Solo en un plan en borrador (el backend responde 409 si ya está publicado). */
  ejecutar(id: string): Promise<void> {
    return this.materias.eliminar(id);
  }
}
