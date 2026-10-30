import type { SesionRepository } from '../../domain/repositories/SesionRepository';

export class CerrarSesion {
  private readonly sesiones: SesionRepository;

  constructor(sesiones: SesionRepository) {
    this.sesiones = sesiones;
  }

  ejecutar(): void {
    this.sesiones.limpiar();
  }
}
