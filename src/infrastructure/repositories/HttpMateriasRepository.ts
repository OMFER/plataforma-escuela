import type { CambiosMateria, Materia, NuevaMateria } from '../../domain/entities/Materia';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';
import type { HttpClient } from '../http/HttpClient';
import type { MateriaDto } from '../mappers/dtos';
import { aMateria } from '../mappers/mappers';

export class HttpMateriasRepository implements MateriasRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async listar(): Promise<Materia[]> {
    return (await this.http.get<MateriaDto[]>('/materias')).map(aMateria);
  }

  async crear(datos: NuevaMateria): Promise<Materia> {
    return aMateria(await this.http.post<MateriaDto>('/materias', datos));
  }

  async actualizar(id: string, cambios: CambiosMateria): Promise<Materia> {
    return aMateria(await this.http.patch<MateriaDto>(`/materias/${encodeURIComponent(id)}`, cambios));
  }

  async eliminar(id: string): Promise<void> {
    await this.http.delete(`/materias/${encodeURIComponent(id)}`);
  }
}
