import type { IntentoAlumno } from '../../domain/entities/Examen';
import type { ExamenesGrupoRepository } from '../../domain/repositories/ExamenesGrupoRepository';

export class ObtenerIntentosExamen {
  private readonly examenes: ExamenesGrupoRepository;

  constructor(examenes: ExamenesGrupoRepository) {
    this.examenes = examenes;
  }

  /** Resultados de un examen en un grupo, ordenados por nombre del alumno. */
  async ejecutar(grupoId: string, examenId: string): Promise<IntentoAlumno[]> {
    const intentos = await this.examenes.obtenerIntentos(grupoId, examenId);
    return [...intentos].sort((a, b) => a.alumno.nombre.localeCompare(b.alumno.nombre, 'es'));
  }
}
