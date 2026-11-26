import type { MateriaEnPlan } from '../../domain/entities/Materia';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';

export class ObtenerMateria {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  /** null si no existe. */
  ejecutar(id: string): Promise<MateriaEnPlan | null> {
    return this.materias.obtener(id);
  }
}
