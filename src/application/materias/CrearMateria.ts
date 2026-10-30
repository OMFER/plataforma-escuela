import { TOTAL_SEMANAS_POR_DEFECTO, type Materia, type NuevaMateria } from '../../domain/entities/Materia';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

const opcional = (valor?: string): string | undefined => {
  const limpio = valor?.trim();
  return limpio ? limpio : undefined;
};

export class CrearMateria {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  async ejecutar(datos: NuevaMateria): Promise<Materia> {
    const totalSemanas = datos.totalSemanas ?? TOTAL_SEMANAS_POR_DEFECTO;
    const limpio: NuevaMateria = {
      nombre: datos.nombre.trim(),
      descripcion: opcional(datos.descripcion),
      grupo: opcional(datos.grupo),
      aula: opcional(datos.aula),
      maestroId: datos.maestroId,
      fechaInicio: datos.fechaInicio,
      totalSemanas,
    };
    const errores: string[] = [];
    if (!limpio.nombre) errores.push('El nombre es obligatorio.');
    if (!limpio.maestroId) errores.push('Elige un maestro.');
    if (!FECHA_ISO.test(limpio.fechaInicio)) errores.push('La fecha de inicio debe tener formato AAAA-MM-DD.');
    if (!Number.isInteger(totalSemanas) || totalSemanas < 1) {
      errores.push('El total de semanas debe ser un entero mayor a 0.');
    }
    if (errores.length > 0) throw new ErrorAplicacion(errores, 400);
    return this.materias.crear(limpio);
  }
}
