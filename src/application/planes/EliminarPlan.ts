import type { PlanesRepository } from '../../domain/repositories/PlanesRepository';

export class EliminarPlan {
  private readonly planes: PlanesRepository;

  constructor(planes: PlanesRepository) {
    this.planes = planes;
  }

  /** El backend responde 409 si algún grupo usa el plan. */
  ejecutar(id: string): Promise<void> {
    return this.planes.eliminar(id);
  }
}
