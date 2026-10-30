import { PUNTAJE_MAXIMO_POR_DEFECTO, type Examen, type NuevoExamen } from '../../domain/entities/Examen';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';
import { usaSemana, validarConfiguracionExamen } from '../../domain/rules/examen';
import { asegurarPreguntasValidas, limpiarPreguntas } from './validarExamen';

export class CrearExamen {
  private readonly examenes: ExamenesRepository;

  constructor(examenes: ExamenesRepository) {
    this.examenes = examenes;
  }

  async ejecutar(datos: NuevoExamen): Promise<Examen> {
    const titulo = datos.titulo.trim();
    if (!titulo) throw new ErrorAplicacion('El título es obligatorio.', 400);
    // El Final nunca lleva semana: se descarta aunque la pantalla la haya enviado.
    const semana = usaSemana(datos.tipo) ? datos.semana : undefined;
    const configuracion = {
      tipo: datos.tipo,
      ...(semana === undefined ? {} : { semana }),
      diasExtra: datos.diasExtra ?? 0,
      puntajeMaximo: datos.puntajeMaximo ?? PUNTAJE_MAXIMO_POR_DEFECTO,
    };
    const errores = validarConfiguracionExamen(configuracion);
    if (errores.length > 0) throw new ErrorAplicacion(errores, 400);
    const preguntas = limpiarPreguntas(datos.preguntas);
    asegurarPreguntasValidas(preguntas);
    return this.examenes.crear({
      materiaId: datos.materiaId,
      ...configuracion,
      titulo,
      descripcion: datos.descripcion?.trim() || undefined,
      preguntas,
    });
  }
}
