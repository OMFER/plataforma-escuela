import type { ExamenesSemana } from '../../domain/entities/Examen';
import type { ExamenesGrupoRepository } from '../../domain/repositories/ExamenesGrupoRepository';

export class ObtenerExamenesSemana {
  private readonly examenes: ExamenesGrupoRepository;

  constructor(examenes: ExamenesGrupoRepository) {
    this.examenes = examenes;
  }

  /** Semanal y Reposición de la semana; cada uno es null si no existe. */
  ejecutar(grupoId: string, semana: number): Promise<ExamenesSemana> {
    return this.examenes.obtenerPorSemana(grupoId, semana);
  }
}
