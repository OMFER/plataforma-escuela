import type { Plan } from '../../domain/entities/Plan';
import type { PlanesRepository } from '../../domain/repositories/PlanesRepository';

export class ActualizarPlan {
  private readonly planes: PlanesRepository;

  constructor(planes: PlanesRepository) {
    this.planes = planes;
  }

  /** Solo la descripción: el nombre identifica al plan y a sus versiones. Se envía '' para borrarla. */
  ejecutar(id: string, descripcion: string): Promise<Plan> {
    return this.planes.actualizar(id, { descripcion: descripcion.trim() });
  }
}
