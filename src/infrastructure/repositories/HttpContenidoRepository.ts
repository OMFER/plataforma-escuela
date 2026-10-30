import type { CambiosContenidoSemana, ContenidoSemana, NuevoContenidoSemana } from '../../domain/entities/Contenido';
import type { ContenidoRepository } from '../../domain/repositories/ContenidoRepository';
import type { HttpClient } from '../http/HttpClient';
import { nuloSiNoExiste } from '../http/nuloSiNoExiste';
import type { ClaseDto } from '../mappers/dtos';
import { aContenido } from '../mappers/mappers';

export class HttpContenidoRepository implements ContenidoRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async obtenerPorSemana(materiaId: string, semana: number): Promise<ContenidoSemana | null> {
    const dto = await nuloSiNoExiste(
      this.http.get<ClaseDto>(`/clases/materia/${encodeURIComponent(materiaId)}/semana/${semana}`),
    );
    return dto ? aContenido(dto) : null;
  }

  async crear(datos: NuevoContenidoSemana): Promise<ContenidoSemana> {
    return aContenido(await this.http.post<ClaseDto>('/clases', datos));
  }

  async actualizar(id: string, cambios: CambiosContenidoSemana): Promise<ContenidoSemana> {
    return aContenido(await this.http.patch<ClaseDto>(`/clases/${encodeURIComponent(id)}`, cambios));
  }
}
