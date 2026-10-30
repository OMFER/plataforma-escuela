import type { Materia } from '../../domain/entities/Materia';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';

export class ListarMaterias {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  ejecutar(): Promise<Materia[]> {
    return this.materias.listar();
  }
}
