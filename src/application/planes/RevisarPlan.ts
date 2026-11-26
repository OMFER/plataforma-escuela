import type { RevisionPlan } from '../../domain/entities/Plan';
import type { PlanesRepository } from '../../domain/repositories/PlanesRepository';

export class RevisarPlan {
  private readonly planes: PlanesRepository;

  constructor(planes: PlanesRepository) {
    this.planes = planes;
  }

  /** Lo que le falta al plan para poder publicarse. */
  ejecutar(id: string): Promise<RevisionPlan> {
    return this.planes.revisar(id);
  }
}
