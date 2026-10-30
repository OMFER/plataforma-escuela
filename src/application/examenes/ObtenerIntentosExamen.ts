import type { IntentoAlumno } from '../../domain/entities/Examen';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';

export class ObtenerIntentosExamen {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  ejecutar(examenId: string): Promise<IntentoAlumno[]> {
    return this.examenes.obtenerIntentos(examenId);
  }
}
