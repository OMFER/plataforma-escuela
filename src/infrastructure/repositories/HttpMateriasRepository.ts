import type { CambiosMateria, Materia, MateriaEnPlan, NuevaMateria } from '../../domain/entities/Materia';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';
import type { HttpClient } from '../http/HttpClient';
import { nuloSiNoExiste } from '../http/nuloSiNoExiste';
import type { MateriaDto } from '../mappers/dtos';
import { aMateria, aMateriaEnPlan } from '../mappers/mappers';

const ruta = (id: string) => `/materias/${encodeURIComponent(id)}`;

export class HttpMateriasRepository implements MateriasRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async listarMias(): Promise<MateriaEnPlan[]> {
    return (await this.http.get<MateriaDto[]>('/materias/mias')).map(aMateriaEnPlan);
  }

  async obtener(id: string): Promise<MateriaEnPlan | null> {
    const dto = await nuloSiNoExiste(this.http.get<MateriaDto>(ruta(id)));
    return dto ? aMateriaEnPlan(dto) : null;
  }

  async crear(datos: NuevaMateria): Promise<Materia> {
    return aMateria(await this.http.post<MateriaDto>('/materias', datos));
  }

  async actualizar(id: string, cambios: CambiosMateria): Promise<Materia> {
    return aMateria(await this.http.patch<MateriaDto>(ruta(id), cambios));
  }

  async eliminar(id: string): Promise<void> {
    await this.http.delete(ruta(id));
  }
}
