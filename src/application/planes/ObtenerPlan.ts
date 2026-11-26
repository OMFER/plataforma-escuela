import type { PlanDetallado } from '../../domain/entities/Plan';
import type { PlanesRepository } from '../../domain/repositories/PlanesRepository';

export class ObtenerPlan {
  private readonly planes: PlanesRepository;

  constructor(planes: PlanesRepository) {
    this.planes = planes;
  }

  /** null si no existe. */
  ejecutar(id: string): Promise<PlanDetallado | null> {
    return this.planes.obtener(id);
  }
}
