import type { ResumenExamen } from '../../domain/entities/Examen';
import type { ExamenesGrupoRepository } from '../../domain/repositories/ExamenesGrupoRepository';

export class ObtenerExamenesSemana {
  private readonly examenes: ExamenesGrupoRepository;

  constructor(examenes: ExamenesGrupoRepository) {
    this.examenes = examenes;
  }

  /** Los dos exámenes de la semana (1 o 2) de la materia, en orden; faltan si aún no existen. */
  async ejecutar(grupoId: string, materiaId: string, semana: number): Promise<ResumenExamen[]> {
    return (await this.examenes.obtenerDeSemana(grupoId, materiaId, semana)).sort((a, b) => a.numero - b.numero);
  }
}
