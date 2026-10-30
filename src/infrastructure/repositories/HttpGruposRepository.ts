import type { CalificacionesAlumno } from '../../domain/entities/Calificaciones';
import type { Grupo, NuevoGrupo } from '../../domain/entities/Grupo';
import type { Usuario } from '../../domain/entities/Usuario';
import type { GruposRepository } from '../../domain/repositories/GruposRepository';
import type { HttpClient } from '../http/HttpClient';
import { nuloSiNoExiste } from '../http/nuloSiNoExiste';
import type { CalificacionesAlumnoDto, GrupoDto, UsuarioDto } from '../mappers/dtos';
import { aCalificaciones, aGrupo, aUsuario } from '../mappers/mappers';

const ruta = (grupoId: string) => `/grupos/${encodeURIComponent(grupoId)}`;

export class HttpGruposRepository implements GruposRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async obtenerMios(): Promise<Grupo[]> {
    return (await this.http.get<GrupoDto[]>('/grupos/mios')).map(aGrupo);
  }

  async listar(): Promise<Grupo[]> {
    return (await this.http.get<GrupoDto[]>('/grupos')).map(aGrupo);
  }

  async obtenerPorId(id: string): Promise<Grupo | null> {
    const dto = await nuloSiNoExiste(this.http.get<GrupoDto>(ruta(id)));
    return dto ? aGrupo(dto) : null;
  }

  async crear(datos: NuevoGrupo): Promise<Grupo> {
    return aGrupo(await this.http.post<GrupoDto>('/grupos', datos));
  }

  async eliminar(id: string): Promise<void> {
    await this.http.delete(ruta(id));
  }

  async listarAlumnos(grupoId: string): Promise<Usuario[]> {
    return (await this.http.get<UsuarioDto[]>(`${ruta(grupoId)}/alumnos`)).map(aUsuario);
  }

  async inscribirAlumnos(grupoId: string, alumnoIds: string[]): Promise<Usuario[]> {
    return (await this.http.post<UsuarioDto[]>(`${ruta(grupoId)}/alumnos`, { alumnoIds })).map(aUsuario);
  }

  async darDeBajaAlumno(grupoId: string, alumnoId: string): Promise<void> {
    await this.http.delete(`${ruta(grupoId)}/alumnos/${encodeURIComponent(alumnoId)}`);
  }

  async obtenerCalificaciones(grupoId: string): Promise<CalificacionesAlumno[]> {
    return (await this.http.get<CalificacionesAlumnoDto[]>(`${ruta(grupoId)}/calificaciones`)).map(aCalificaciones);
  }
}
