import type { Sesion } from '../../domain/entities/Usuario';
import type { SesionRepository } from '../../domain/repositories/SesionRepository';

export class ObtenerSesionActual {
  private readonly sesiones: SesionRepository;

  constructor(sesiones: SesionRepository) {
    this.sesiones = sesiones;
  }

  ejecutar(): Sesion | null {
    return this.sesiones.obtener();
  }
}
