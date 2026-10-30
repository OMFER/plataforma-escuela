import type { ResultadoIntento } from '../../domain/entities/Examen';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';
import { estanTodasRespondidas, type Respuestas } from '../../domain/rules/examen';

export class ResponderExamen {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  async ejecutar(examenId: string, respuestas: Respuestas, totalPreguntas: number): Promise<ResultadoIntento> {
    if (!estanTodasRespondidas(respuestas, totalPreguntas)) {
      throw new ErrorAplicacion('Responde todas las preguntas antes de enviar.', 400);
    }
    return this.examenes.responder(examenId, respuestas as number[]);
  }
}
