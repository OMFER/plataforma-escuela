import type { CalificacionesAlumno } from '../../domain/entities/Calificaciones';
import type { GruposRepository } from '../../domain/repositories/GruposRepository';

export class ObtenerCalificaciones {
  private readonly grupos: GruposRepository;

  constructor(grupos: GruposRepository) {
    this.grupos = grupos;
  }

  /** Semanas en orden y alumnos por nombre, para que las tablas no dependan del orden del servidor. */
  async ejecutar(grupoId: string): Promise<CalificacionesAlumno[]> {
    const lista = await this.grupos.obtenerCalificaciones(grupoId);
    return lista
      .map((c) => ({ ...c, semanas: [...c.semanas].sort((a, b) => a.semana - b.semana) }))
      .sort((a, b) => a.alumno.nombre.localeCompare(b.alumno.nombre, 'es'));
  }
}
