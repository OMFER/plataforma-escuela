import type { CambiosExamen, Examen } from '../../domain/entities/Examen';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';
import { validarDiasExtra, validarPuntajeMaximo } from '../../domain/rules/examen';
import { asegurarPreguntasValidas, limpiarPreguntas } from './validarExamen';

export class ActualizarExamen {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  /** Si `cambios.preguntas` es undefined, las preguntas no se tocan (evita 409 cuando ya hay intentos). */
  async ejecutar(id: string, cambios: CambiosExamen): Promise<Examen> {
    const limpio: CambiosExamen = { ...cambios };
    const errores = [...validarDiasExtra(limpio.diasExtra), ...validarPuntajeMaximo(limpio.puntajeMaximo)];
    if (limpio.titulo !== undefined) {
      limpio.titulo = limpio.titulo.trim();
      if (!limpio.titulo) errores.push('El título es obligatorio.');
    }
    if (limpio.descripcion !== undefined) limpio.descripcion = limpio.descripcion.trim();
    if (errores.length > 0) throw new ErrorAplicacion(errores, 400);
    if (limpio.preguntas) {
      limpio.preguntas = limpiarPreguntas(limpio.preguntas);
      asegurarPreguntasValidas(limpio.preguntas);
    }
    return this.examenes.actualizar(id, limpio);
  }
}
