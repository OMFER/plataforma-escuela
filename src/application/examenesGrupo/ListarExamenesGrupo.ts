import type { ResumenExamen } from '../../domain/entities/Examen';
import type { ExamenesGrupoRepository } from '../../domain/repositories/ExamenesGrupoRepository';

export class ListarExamenesGrupo {
  private readonly examenes: ExamenesGrupoRepository;

  constructor(examenes: ExamenesGrupoRepository) {
    this.examenes = examenes;
  }

  ejecutar(grupoId: string): Promise<ResumenExamen[]> {
    return this.examenes.listar(grupoId);
  }
}
