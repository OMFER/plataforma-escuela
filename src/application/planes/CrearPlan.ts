import type { NuevoPlan, Plan } from '../../domain/entities/Plan';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { PlanesRepository } from '../../domain/repositories/PlanesRepository';

export class CrearPlan {
  private readonly planes: PlanesRepository;

  constructor(planes: PlanesRepository) {
    this.planes = planes;
  }

  /** Nace como la versión 1, en borrador. */
  async ejecutar(datos: NuevoPlan): Promise<Plan> {
    const nombre = datos.nombre.trim();
    if (!nombre) throw new ErrorAplicacion('El nombre del plan es obligatorio.', 400);
    const descripcion = datos.descripcion?.trim();
    return this.planes.crear({ nombre, ...(descripcion ? { descripcion } : {}) });
  }
}
