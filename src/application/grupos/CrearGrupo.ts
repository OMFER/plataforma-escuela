import type { Grupo, NuevoGrupo } from '../../domain/entities/Grupo';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { GruposRepository } from '../../domain/repositories/GruposRepository';

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export class CrearGrupo {
  private readonly grupos: GruposRepository;

  constructor(grupos: GruposRepository) {
    this.grupos = grupos;
  }

  async ejecutar(datos: NuevoGrupo): Promise<Grupo> {
    const aula = datos.aula?.trim();
    const limpio: NuevoGrupo = {
      materiaId: datos.materiaId,
      maestroId: datos.maestroId,
      nombre: datos.nombre.trim(),
      periodo: datos.periodo.trim(),
      fechaInicio: datos.fechaInicio,
      ...(aula ? { aula } : {}),
    };
    const errores: string[] = [];
    if (!limpio.materiaId) errores.push('Elige una materia.');
    if (!limpio.maestroId) errores.push('Elige un maestro.');
    if (!limpio.nombre) errores.push('El nombre del grupo es obligatorio.');
    if (!limpio.periodo) errores.push('El periodo es obligatorio.');
    if (!FECHA_ISO.test(limpio.fechaInicio)) errores.push('La fecha de inicio debe tener formato AAAA-MM-DD.');
    if (errores.length > 0) throw new ErrorAplicacion(errores, 400);
    return this.grupos.crear(limpio);
  }
}
