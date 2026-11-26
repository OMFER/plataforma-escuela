import type { ExamenGrupo, ResultadoConRevision, ResumenExamen } from '../entities/Examen';

/** Exámenes del plan vistos desde un grupo: ventanas, respuestas e intentos. */
export interface ExamenesGrupoRepository {
  listar(grupoId: string): Promise<ResumenExamen[]>;
  /** Los dos exámenes de una semana (1 o 2) de una materia. */
  obtenerDeSemana(grupoId: string, materiaId: string, semana: number): Promise<ResumenExamen[]>;
  obtener(grupoId: string, examenId: string): Promise<ExamenGrupo | null>;
  responder(grupoId: string, examenId: string, respuestas: number[]): Promise<ResultadoConRevision>;
}
