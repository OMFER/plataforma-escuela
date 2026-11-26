import type { CalificacionesGrupo } from '../../domain/entities/Calificaciones';
import type { GruposRepository } from '../../domain/repositories/GruposRepository';

export class ObtenerCalificaciones {
  private readonly grupos: GruposRepository;

  constructor(grupos: GruposRepository) {
    this.grupos = grupos;
  }

  /** Alumnos por nombre, para que la tabla no dependa del orden del servidor. */
  async ejecutar(grupoId: string): Promise<CalificacionesGrupo> {
    const { materias, boletas } = await this.grupos.obtenerCalificaciones(grupoId);
    return {
      materias,
      boletas: [...boletas].sort((a, b) => a.alumno.nombre.localeCompare(b.alumno.nombre, 'es')),
    };
  }
}
