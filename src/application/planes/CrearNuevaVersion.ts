import type { Plan } from '../../domain/entities/Plan';
import type { PlanesRepository } from '../../domain/repositories/PlanesRepository';

export class CrearNuevaVersion {
  private readonly planes: PlanesRepository;

  constructor(planes: PlanesRepository) {
    this.planes = planes;
  }

  /** Copia materias, contenido y exámenes a un borrador; los grupos existentes no cambian. */
  ejecutar(id: string): Promise<Plan> {
    return this.planes.crearNuevaVersion(id);
  }
}
