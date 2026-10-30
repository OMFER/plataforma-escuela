import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';

export class EliminarExamen {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  /** Borra también sus intentos. El backend responde 409 si es un Semanal que tiene Reposición. */
  ejecutar(id: string): Promise<void> {
    return this.examenes.eliminar(id);
  }
}
