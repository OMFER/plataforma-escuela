import type { Materia } from '../../domain/entities/Materia';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';

export class ObtenerMateria {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  ejecutar(id: string): Promise<Materia | null> {
    return this.materias.obtenerPorId(id);
  }
}
