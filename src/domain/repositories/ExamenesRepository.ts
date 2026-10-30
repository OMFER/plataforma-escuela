import type { CambiosExamen, Examen, IntentoAlumno, NuevoExamen, ResultadoIntento } from '../entities/Examen';

export interface ExamenesRepository {
  /** Devuelve null si la semana no tiene examen. */
  obtenerPorSemana(materiaId: string, semana: number): Promise<Examen | null>;
  obtenerPorId(id: string): Promise<Examen | null>;
  crear(datos: NuevoExamen): Promise<Examen>;
  actualizar(id: string, cambios: CambiosExamen): Promise<Examen>;
  responder(id: string, respuestas: number[]): Promise<ResultadoIntento>;
  obtenerIntentos(id: string): Promise<IntentoAlumno[]>;
}
