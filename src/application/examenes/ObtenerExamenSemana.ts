import type { Examen } from '../../domain/entities/Examen';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';

export class ObtenerExamenSemana {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  /** null si la semana no tiene examen. */
  ejecutar(materiaId: string, semana: number): Promise<Examen | null> {
    return this.examenes.obtenerPorSemana(materiaId, semana);
  }
}
