import type { Usuario } from '../../domain/entities/Usuario';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';

export class ObtenerAlumnosMateria {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  ejecutar(materiaId: string): Promise<Usuario[]> {
    return this.materias.listarAlumnos(materiaId);
  }
}
