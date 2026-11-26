import type { Plan } from '../../domain/entities/Plan';
import type { PlanesRepository } from '../../domain/repositories/PlanesRepository';

export class PublicarPlan {
  private readonly planes: PlanesRepository;

  constructor(planes: PlanesRepository) {
    this.planes = planes;
  }

  /** Si el plan está incompleto, el error trae cada pendiente. */
  ejecutar(id: string): Promise<Plan> {
    return this.planes.publicar(id);
  }
}
