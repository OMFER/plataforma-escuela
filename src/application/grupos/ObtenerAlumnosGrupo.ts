import type { Usuario } from '../../domain/entities/Usuario';
import type { GruposRepository } from '../../domain/repositories/GruposRepository';

export class ObtenerAlumnosGrupo {
  private readonly grupos: GruposRepository;

  constructor(grupos: GruposRepository) {
    this.grupos = grupos;
  }

  ejecutar(grupoId: string): Promise<Usuario[]> {
    return this.grupos.listarAlumnos(grupoId);
  }
}
