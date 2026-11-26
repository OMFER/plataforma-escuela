import type { CambioPlan } from '../../domain/entities/Plan';
import type { PlanesRepository } from '../../domain/repositories/PlanesRepository';

export class ListarCambiosPlan {
  private readonly planes: PlanesRepository;

  constructor(planes: PlanesRepository) {
    this.planes = planes;
  }

  /** Bitácora del plan, del cambio más reciente al más antiguo. */
  ejecutar(id: string): Promise<CambioPlan[]> {
    return this.planes.listarCambios(id);
  }
}
