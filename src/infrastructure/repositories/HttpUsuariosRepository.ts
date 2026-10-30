import type { NuevoUsuario, Rol, Usuario } from '../../domain/entities/Usuario';
import type { UsuariosRepository } from '../../domain/repositories/UsuariosRepository';
import type { HttpClient } from '../http/HttpClient';
import type { UsuarioDto } from '../mappers/dtos';
import { aUsuario } from '../mappers/mappers';

export class HttpUsuariosRepository implements UsuariosRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async obtenerActual(): Promise<Usuario> {
    return aUsuario(await this.http.get<UsuarioDto>('/usuarios/me'));
  }

  async listar(rol?: Rol): Promise<Usuario[]> {
    const dtos = await this.http.get<UsuarioDto[]>('/usuarios', { query: { rol } });
    return dtos.map(aUsuario);
  }

  async crear(datos: NuevoUsuario): Promise<Usuario> {
    return aUsuario(await this.http.post<UsuarioDto>('/usuarios', datos));
  }
}
