import type { Usuario } from '../../domain/entities/Usuario';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { GruposRepository } from '../../domain/repositories/GruposRepository';

export class InscribirAlumnos {
  private readonly grupos: GruposRepository;

  constructor(grupos: GruposRepository) {
    this.grupos = grupos;
  }

  async ejecutar(grupoId: string, alumnoIds: string[]): Promise<Usuario[]> {
    const unicos = [...new Set(alumnoIds.filter(Boolean))];
    if (unicos.length === 0) throw new ErrorAplicacion('Selecciona al menos un alumno.', 400);
    return this.grupos.inscribirAlumnos(grupoId, unicos);
  }
}
