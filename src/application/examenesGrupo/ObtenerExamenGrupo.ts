import type { ExamenGrupo } from '../../domain/entities/Examen';
import type { ExamenesGrupoRepository } from '../../domain/repositories/ExamenesGrupoRepository';

export class ObtenerExamenGrupo {
  private readonly examenes: ExamenesGrupoRepository;

  constructor(examenes: ExamenesGrupoRepository) {
    this.examenes = examenes;
  }

  /** Para el alumno trae las preguntas solo si la ventana está abierta, o la revisión si ya respondió. */
  ejecutar(grupoId: string, examenId: string): Promise<ExamenGrupo | null> {
    return this.examenes.obtener(grupoId, examenId);
  }
}
