import type { Usuario } from '../../domain/entities/Usuario';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';

export class InscribirAlumnos {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  async ejecutar(materiaId: string, alumnoIds: string[]): Promise<Usuario[]> {
    const unicos = [...new Set(alumnoIds.filter(Boolean))];
    if (unicos.length === 0) throw new ErrorAplicacion('Selecciona al menos un alumno.', 400);
    return this.materias.inscribirAlumnos(materiaId, unicos);
  }
}
