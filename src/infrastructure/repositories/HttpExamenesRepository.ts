import type { CambiosExamen, Examen, NuevoExamen } from '../../domain/entities/Examen';
import type { ExamenesRepository } from '../../domain/repositories/ExamenesRepository';
import type { HttpClient } from '../http/HttpClient';
import { nuloSiNoExiste } from '../http/nuloSiNoExiste';
import type { ExamenDto } from '../mappers/dtos';
import { aExamen } from '../mappers/mappers';

export class HttpExamenesRepository implements ExamenesRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async obtenerPorId(id: string): Promise<Examen | null> {
    const dto = await nuloSiNoExiste(this.http.get<ExamenDto>(`/examenes/${encodeURIComponent(id)}`));
    return dto ? aExamen(dto) : null;
  }

  async listarPorMateria(materiaId: string): Promise<Examen[]> {
    return (await this.http.get<ExamenDto[]>(`/examenes/materia/${encodeURIComponent(materiaId)}`)).map(aExamen);
  }

  async importar(materiaId: string, csv: string): Promise<Examen[]> {
    const dtos = await this.http.post<ExamenDto[]>(`/examenes/materia/${encodeURIComponent(materiaId)}/importar`, { csv });
    return dtos.map(aExamen);
  }

  async crear(datos: NuevoExamen): Promise<Examen> {
    return aExamen(await this.http.post<ExamenDto>('/examenes', datos));
  }

  async actualizar(id: string, cambios: CambiosExamen): Promise<Examen> {
    return aExamen(await this.http.patch<ExamenDto>(`/examenes/${encodeURIComponent(id)}`, cambios));
  }

  async eliminar(id: string): Promise<void> {
    await this.http.delete(`/examenes/${encodeURIComponent(id)}`);
  }
}
