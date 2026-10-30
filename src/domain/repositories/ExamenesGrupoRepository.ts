import type { ExamenGrupo, ExamenesSemana, IntentoAlumno, ResultadoConRevision, ResumenExamen } from '../entities/Examen';

/** Exámenes de la materia vistos desde un grupo: ventanas, respuestas e intentos. */
export interface ExamenesGrupoRepository {
  listar(grupoId: string): Promise<ResumenExamen[]>;
  obtenerPorSemana(grupoId: string, semana: number): Promise<ExamenesSemana>;
  obtener(grupoId: string, examenId: string): Promise<ExamenGrupo | null>;
  responder(grupoId: string, examenId: string, respuestas: number[]): Promise<ResultadoConRevision>;
  obtenerIntentos(grupoId: string, examenId: string): Promise<IntentoAlumno[]>;
}
