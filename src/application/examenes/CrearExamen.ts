import { PUNTAJE_MAXIMO_POR_DEFECTO, type Examen, type NuevoExamen } from '../../domain/entities/Examen';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';
import { asegurarPreguntasValidas, limpiarPreguntas } from './validarExamen';

export class CrearExamen {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  async ejecutar(datos: NuevoExamen): Promise<Examen> {
    const titulo = datos.titulo.trim();
    if (!titulo) throw new ErrorAplicacion('El título es obligatorio.', 400);
    const preguntas = limpiarPreguntas(datos.preguntas);
    asegurarPreguntasValidas(preguntas);
    return this.examenes.crear({
      ...datos,
      titulo,
      descripcion: datos.descripcion?.trim() || undefined,
      puntajeMaximo: datos.puntajeMaximo ?? PUNTAJE_MAXIMO_POR_DEFECTO,
      preguntas,
    });
  }
}
