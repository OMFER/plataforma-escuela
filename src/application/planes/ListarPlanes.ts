import type { Plan } from '../../domain/entities/Plan';
import type { PlanesRepository } from '../../domain/repositories/PlanesRepository';

export class ListarPlanes {
  private readonly planes: PlanesRepository;

  constructor(planes: PlanesRepository) {
    this.planes = planes;
  }

  /** Del plan más reciente al más antiguo dentro de cada nombre. */
  ejecutar(): Promise<Plan[]> {
    return this.planes.listar();
  }
}
