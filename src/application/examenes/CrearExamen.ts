import type { Examen, NuevoExamen } from '../../domain/entities/Examen';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';
import { esNumeroDeExamen, esSemanaDeMateria, validarDiasExtra } from '../../domain/rules/examen';
import { asegurarPreguntasValidas, limpiarPreguntas } from './validarExamen';

export class CrearExamen {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  async ejecutar(datos: NuevoExamen): Promise<Examen> {
    const titulo = datos.titulo.trim();
    const diasExtra = datos.diasExtra ?? 0;
    const errores = validarDiasExtra(diasExtra);
    if (!titulo) errores.push('El título es obligatorio.');
    if (!esSemanaDeMateria(datos.semana)) errores.push('Elige la semana 1 o 2 de la materia.');
    if (!esNumeroDeExamen(datos.numero)) errores.push('Elige el examen 1 o 2 de la semana.');
    if (errores.length > 0) throw new ErrorAplicacion(errores, 400);
    const preguntas = limpiarPreguntas(datos.preguntas);
    asegurarPreguntasValidas(preguntas);
    return this.examenes.crear({
      materiaId: datos.materiaId,
      semana: datos.semana,
      numero: datos.numero,
      titulo,
      diasExtra,
      descripcion: datos.descripcion?.trim() || undefined,
      preguntas,
    });
  }
}
