import type { CambiosMateria, Materia } from '../../domain/entities/Materia';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';
import { limpiarMateria } from './validarMateria';

export class ActualizarMateria {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  /** Se envía la descripción vacía ('') para poder borrarla. */
  async ejecutar(id: string, cambios: CambiosMateria): Promise<Materia> {
    return this.materias.actualizar(id, limpiarMateria(cambios));
  }
}
