import type { CambiosExamen, Examen, IntentoAlumno, NuevoExamen, ResultadoIntento } from '../../domain/entities/Examen';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';
import type { HttpClient } from '../http/HttpClient';
import { nuloSiNoExiste } from '../http/nuloSiNoExiste';
import type { ExamenDto, IntentoDto, ResultadoIntentoDto } from '../mappers/dtos';
import { aExamen, aIntento, aResultado } from '../mappers/mappers';

export class HttpExamenesRepository implements ExamenesRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async obtenerPorSemana(materiaId: string, semana: number): Promise<Examen | null> {
    const dto = await nuloSiNoExiste(
      this.http.get<ExamenDto>(`/examenes/materia/${encodeURIComponent(materiaId)}/semana/${semana}`),
    );
    return dto ? aExamen(dto) : null;
  }

  async obtenerPorId(id: string): Promise<Examen | null> {
    const dto = await nuloSiNoExiste(this.http.get<ExamenDto>(`/examenes/${encodeURIComponent(id)}`));
    return dto ? aExamen(dto) : null;
  }

  async crear(datos: NuevoExamen): Promise<Examen> {
    return aExamen(await this.http.post<ExamenDto>('/examenes', datos));
  }

  async actualizar(id: string, cambios: CambiosExamen): Promise<Examen> {
    return aExamen(await this.http.patch<ExamenDto>(`/examenes/${encodeURIComponent(id)}`, cambios));
  }

  async responder(id: string, respuestas: number[]): Promise<ResultadoIntento> {
    const dto = await this.http.post<ResultadoIntentoDto>(`/examenes/${encodeURIComponent(id)}/intentos`, { respuestas });
    return aResultado(dto);
  }

  async obtenerIntentos(id: string): Promise<IntentoAlumno[]> {
    return (await this.http.get<IntentoDto[]>(`/examenes/${encodeURIComponent(id)}/intentos`)).map(aIntento);
  }
}
