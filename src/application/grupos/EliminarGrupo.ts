import type { GruposRepository } from '../../domain/repositories/GruposRepository';

export class EliminarGrupo {
  private readonly grupos: GruposRepository;

  constructor(grupos: GruposRepository) {
    this.grupos = grupos;
  }

  /** Borra inscripciones y calificaciones del grupo; la materia y su contenido se conservan. */
  ejecutar(id: string): Promise<void> {
    return this.grupos.eliminar(id);
  }
}
