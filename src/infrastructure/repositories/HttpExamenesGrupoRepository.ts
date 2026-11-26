import type { ExamenGrupo, ResultadoConRevision, ResumenExamen } from '../../domain/entities/Examen';
import type { ExamenesGrupoRepository } from '../../domain/repositories/ExamenesGrupoRepository';
import type { HttpClient } from '../http/HttpClient';
import { nuloSiNoExiste } from '../http/nuloSiNoExiste';
import type { ExamenGrupoDto, ResultadoRevisionDto, ResumenExamenDto } from '../mappers/dtos';
import { aExamenGrupo, aResultadoConRevision, aResumenExamen } from '../mappers/mappers';

const rutaGrupo = (grupoId: string) => `/grupos/${encodeURIComponent(grupoId)}`;
const rutaExamen = (grupoId: string, examenId: string) => `${rutaGrupo(grupoId)}/examenes/${encodeURIComponent(examenId)}`;

export class HttpExamenesGrupoRepository implements ExamenesGrupoRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async listar(grupoId: string): Promise<ResumenExamen[]> {
    return (await this.http.get<ResumenExamenDto[]>(`${rutaGrupo(grupoId)}/examenes`)).map(aResumenExamen);
  }

  async obtenerDeSemana(grupoId: string, materiaId: string, semana: number): Promise<ResumenExamen[]> {
    const dtos = await this.http.get<ResumenExamenDto[]>(
      `${rutaGrupo(grupoId)}/materias/${encodeURIComponent(materiaId)}/semanas/${semana}/examenes`,
    );
    return dtos.map(aResumenExamen);
  }

  async obtener(grupoId: string, examenId: string): Promise<ExamenGrupo | null> {
    const dto = await nuloSiNoExiste(this.http.get<ExamenGrupoDto>(rutaExamen(grupoId, examenId)));
    return dto ? aExamenGrupo(dto) : null;
  }

  async responder(grupoId: string, examenId: string, respuestas: number[]): Promise<ResultadoConRevision> {
    const dto = await this.http.post<ResultadoRevisionDto>(`${rutaExamen(grupoId, examenId)}/intentos`, { respuestas });
    return aResultadoConRevision(dto);
  }
}
