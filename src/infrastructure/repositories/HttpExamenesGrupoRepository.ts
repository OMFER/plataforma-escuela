import type { ExamenGrupo, ExamenesSemana, IntentoAlumno, ResultadoConRevision, ResumenExamen } from '../../domain/entities/Examen';
import type { ExamenesGrupoRepository } from '../../domain/repositories/ExamenesGrupoRepository';
import type { HttpClient } from '../http/HttpClient';
import { nuloSiNoExiste } from '../http/nuloSiNoExiste';
import type { ExamenesSemanaDto, ExamenGrupoDto, IntentoDto, ResultadoRevisionDto, ResumenExamenDto } from '../mappers/dtos';
import { aExamenGrupo, aIntento, aResultadoConRevision, aResumenExamen } from '../mappers/mappers';

const ruta = (grupoId: string) => `/grupos/${encodeURIComponent(grupoId)}/examenes`;
const rutaExamen = (grupoId: string, examenId: string) => `${ruta(grupoId)}/${encodeURIComponent(examenId)}`;

export class HttpExamenesGrupoRepository implements ExamenesGrupoRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async listar(grupoId: string): Promise<ResumenExamen[]> {
    return (await this.http.get<ResumenExamenDto[]>(ruta(grupoId))).map(aResumenExamen);
  }

  async obtenerPorSemana(grupoId: string, semana: number): Promise<ExamenesSemana> {
    const dto = await this.http.get<ExamenesSemanaDto>(`${ruta(grupoId)}/semana/${semana}`);
    return {
      semanal: dto?.semanal ? aResumenExamen(dto.semanal) : null,
      reposicion: dto?.reposicion ? aResumenExamen(dto.reposicion) : null,
    };
  }

  async obtener(grupoId: string, examenId: string): Promise<ExamenGrupo | null> {
    const dto = await nuloSiNoExiste(this.http.get<ExamenGrupoDto>(rutaExamen(grupoId, examenId)));
    return dto ? aExamenGrupo(dto) : null;
  }

  async responder(grupoId: string, examenId: string, respuestas: number[]): Promise<ResultadoConRevision> {
    const dto = await this.http.post<ResultadoRevisionDto>(`${rutaExamen(grupoId, examenId)}/intentos`, { respuestas });
    return aResultadoConRevision(dto);
  }

  async obtenerIntentos(grupoId: string, examenId: string): Promise<IntentoAlumno[]> {
    return (await this.http.get<IntentoDto[]>(`${rutaExamen(grupoId, examenId)}/intentos`)).map(aIntento);
  }
}
