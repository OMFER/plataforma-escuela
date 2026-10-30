import type { Examen } from '../../domain/entities/Examen';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';

export class ObtenerExamen {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  ejecutar(id: string): Promise<Examen | null> {
    return this.examenes.obtenerPorId(id);
  }
}
