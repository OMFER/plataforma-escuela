import type { MateriaEnPlan } from '../../domain/entities/Materia';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';

export class ListarMisMaterias {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  /** Materias asignadas al maestro de la sesión, con su versión del plan. */
  ejecutar(): Promise<MateriaEnPlan[]> {
    return this.materias.listarMias();
  }
}
