import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';

export class EliminarExamen {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  /** Solo en un plan en borrador (el backend responde 409 si ya está publicado). */
  ejecutar(id: string): Promise<void> {
    return this.examenes.eliminar(id);
  }
}
