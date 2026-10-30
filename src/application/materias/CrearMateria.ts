import { TOTAL_SEMANAS_POR_DEFECTO, type Materia, type NuevaMateria } from '../../domain/entities/Materia';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';
import { limpiarMateria } from './validarMateria';

export class CrearMateria {
  private readonly materias: MateriasRepository;

  constructor(materias: MateriasRepository) {
    this.materias = materias;
  }

  async ejecutar(datos: NuevaMateria): Promise<Materia> {
    const limpio = limpiarMateria({ ...datos, totalSemanas: datos.totalSemanas ?? TOTAL_SEMANAS_POR_DEFECTO });
    return this.materias.crear({
      nombre: limpio.nombre ?? '',
      descripcion: limpio.descripcion || undefined,
      totalSemanas: limpio.totalSemanas,
    });
  }
}
