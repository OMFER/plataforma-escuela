import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';

export class DarDeBajaAlumno {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  ejecutar(materiaId: string, alumnoId: string): Promise<void> {
    return this.materias.darDeBajaAlumno(materiaId, alumnoId);
  }
}
