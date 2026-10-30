import type { GruposRepository } from '../../domain/repositories/GruposRepository';

export class DarDeBajaAlumno {
  private readonly grupos: GruposRepository;

  constructor(grupos: GruposRepository) {
    this.grupos = grupos;
  }

  ejecutar(grupoId: string, alumnoId: string): Promise<void> {
    return this.grupos.darDeBajaAlumno(grupoId, alumnoId);
  }
}
