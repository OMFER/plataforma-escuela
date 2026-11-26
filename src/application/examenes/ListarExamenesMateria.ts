import type { Examen } from '../../domain/entities/Examen';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';

export class ListarExamenesMateria {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  /** Los exámenes de la materia por semana y número. */
  async ejecutar(materiaId: string): Promise<Examen[]> {
    return (await this.examenes.listarPorMateria(materiaId)).sort((a, b) => a.semana - b.semana || a.numero - b.numero);
  }
}
