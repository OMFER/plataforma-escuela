import type { Materia, NuevaMateria } from '../../domain/entities/Materia';
import type { Usuario } from '../../domain/entities/Usuario';
import type { MateriasRepository } from '../../domain/repositories/MateriasRepository';
import type { HttpClient } from '../http/HttpClient';
import { nuloSiNoExiste } from '../http/nuloSiNoExiste';
import type { MateriaDto, UsuarioDto } from '../mappers/dtos';
import { aMateria, aUsuario } from '../mappers/mappers';

export class HttpMateriasRepository implements MateriasRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async obtenerMias(): Promise<Materia[]> {
    return (await this.http.get<MateriaDto[]>('/materias/mias')).map(aMateria);
  }

  async obtenerPorId(id: string): Promise<Materia | null> {
    const dto = await nuloSiNoExiste(this.http.get<MateriaDto>(`/materias/${encodeURIComponent(id)}`));
    return dto ? aMateria(dto) : null;
  }

  async listar(): Promise<Materia[]> {
    return (await this.http.get<MateriaDto[]>('/materias')).map(aMateria);
  }

  async crear(datos: NuevaMateria): Promise<Materia> {
    return aMateria(await this.http.post<MateriaDto>('/materias', datos));
  }

  async listarAlumnos(materiaId: string): Promise<Usuario[]> {
    return (await this.http.get<UsuarioDto[]>(`/materias/${encodeURIComponent(materiaId)}/alumnos`)).map(aUsuario);
  }

  async inscribirAlumnos(materiaId: string, alumnoIds: string[]): Promise<Usuario[]> {
    const dtos = await this.http.post<UsuarioDto[]>(`/materias/${encodeURIComponent(materiaId)}/alumnos`, { alumnoIds });
    return dtos.map(aUsuario);
  }

  async darDeBajaAlumno(materiaId: string, alumnoId: string): Promise<void> {
    await this.http.delete(`/materias/${encodeURIComponent(materiaId)}/alumnos/${encodeURIComponent(alumnoId)}`);
  }
}
