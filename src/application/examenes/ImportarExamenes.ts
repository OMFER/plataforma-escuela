import type { Examen } from '../../domain/entities/Examen';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';

/** Los exámenes de una materia caben de sobra; es el mismo límite que acepta el servidor. */
export const TAMANO_MAXIMO_CSV = 100_000;

export class ImportarExamenes {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  /**
   * Envía el CSV de la plantilla. El servidor valida toda la hoja: si hay errores no guarda nada
   * y el ErrorAplicacion trae un mensaje por fila ("Fila 4: …").
   */
  async ejecutar(materiaId: string, csv: string): Promise<Examen[]> {
    if (!csv.trim()) throw new ErrorAplicacion('El archivo está vacío.', 400);
    if (csv.length > TAMANO_MAXIMO_CSV) throw new ErrorAplicacion('El archivo es demasiado grande.', 400);
    return this.examenes.importar(materiaId, csv);
  }
}
