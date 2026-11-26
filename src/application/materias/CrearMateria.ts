import type { Materia, NuevaMateria } from '../../domain/entities/Materia';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';
import { limpiarMateria } from './limpiarMateria';

export class CrearMateria {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  async ejecutar(datos: NuevaMateria): Promise<Materia> {
    const limpio = limpiarMateria(datos);
    return this.materias.crear({
      planId: datos.planId,
      nombre: limpio.nombre ?? '',
      bloque: datos.bloque,
      ...(limpio.descripcion ? { descripcion: limpio.descripcion } : {}),
      ...(datos.maestroId ? { maestroId: datos.maestroId } : {}),
    });
  }
}
