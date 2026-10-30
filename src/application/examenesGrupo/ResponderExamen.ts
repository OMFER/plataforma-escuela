import type { ResultadoConRevision } from '../../domain/entities/Examen';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { ExamenesGrupoRepository } from '../../domain/repositories/ExamenesGrupoRepository';
import { estanTodasRespondidas, type Respuestas } from '../../domain/rules/examen';

export interface SolicitudResponderExamen {
  grupoId: string;
  examenId: string;
  respuestas: Respuestas;
  totalPreguntas: number;
}

export class ResponderExamen {
  private readonly examenes: ExamenesGrupoRepository;

  constructor(examenes: ExamenesGrupoRepository) {
    this.examenes = examenes;
  }

  async ejecutar({ grupoId, examenId, respuestas, totalPreguntas }: SolicitudResponderExamen): Promise<ResultadoConRevision> {
    if (!estanTodasRespondidas(respuestas, totalPreguntas)) {
      throw new ErrorAplicacion('Responde todas las preguntas antes de enviar.', 400);
    }
    return this.examenes.responder(grupoId, examenId, respuestas as number[]);
  }
}
