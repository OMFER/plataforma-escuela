import type { Grupo, NuevoGrupo } from '../../domain/entities/Grupo';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { GruposRepository } from '../../domain/repositories/GruposRepository';
import { esLunes } from '../../domain/rules/fechas';

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export class CrearGrupo {
  private readonly grupos: GruposRepository;

  constructor(grupos: GruposRepository) {
    this.grupos = grupos;
  }

  async ejecutar(datos: NuevoGrupo): Promise<Grupo> {
    const limpio: NuevoGrupo = { planId: datos.planId, nombre: datos.nombre.trim(), fechaInicio: datos.fechaInicio };
    const errores: string[] = [];
    if (!limpio.planId) errores.push('Elige un plan publicado.');
    if (!limpio.nombre) errores.push('El nombre del grupo es obligatorio.');
    if (!FECHA_ISO.test(limpio.fechaInicio)) errores.push('La fecha de inicio debe tener formato AAAA-MM-DD.');
    else if (!esLunes(limpio.fechaInicio)) errores.push('La fecha de inicio debe ser un lunes.');
    if (errores.length > 0) throw new ErrorAplicacion(errores, 400);
    return this.grupos.crear(limpio);
  }
}
