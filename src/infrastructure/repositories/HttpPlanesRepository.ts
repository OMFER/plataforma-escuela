import type { CambioPlan, NuevoPlan, Plan, PlanDetallado, RevisionPlan } from '../../domain/entities/Plan';
import type { PlanesRepository } from '../../domain/repositories/PlanesRepository';
import type { HttpClient } from '../http/HttpClient';
import { nuloSiNoExiste } from '../http/nuloSiNoExiste';
import type { CambioDto, PlanDetalladoDto, PlanDto, RevisionPlanDto } from '../mappers/dtos';
import { aCambio, aPlan, aPlanDetallado } from '../mappers/mappers';

const ruta = (id: string) => `/planes/${encodeURIComponent(id)}`;

export class HttpPlanesRepository implements PlanesRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async listar(): Promise<Plan[]> {
    return (await this.http.get<PlanDto[]>('/planes')).map(aPlan);
  }

  async obtener(id: string): Promise<PlanDetallado | null> {
    const dto = await nuloSiNoExiste(this.http.get<PlanDetalladoDto>(ruta(id)));
    return dto ? aPlanDetallado(dto) : null;
  }

  async crear(datos: NuevoPlan): Promise<Plan> {
    return aPlan(await this.http.post<PlanDto>('/planes', datos));
  }

  async actualizar(id: string, cambios: { descripcion: string }): Promise<Plan> {
    return aPlan(await this.http.patch<PlanDto>(ruta(id), cambios));
  }

  async eliminar(id: string): Promise<void> {
    await this.http.delete(ruta(id));
  }

  async revisar(id: string): Promise<RevisionPlan> {
    const dto = await this.http.get<RevisionPlanDto>(`${ruta(id)}/pendientes`);
    return { listo: dto.listo, pendientes: dto.pendientes ?? [] };
  }

  async publicar(id: string): Promise<Plan> {
    return aPlan(await this.http.post<PlanDto>(`${ruta(id)}/publicar`));
  }

  async crearNuevaVersion(id: string): Promise<Plan> {
    return aPlan(await this.http.post<PlanDto>(`${ruta(id)}/versiones`));
  }

  async listarCambios(id: string): Promise<CambioPlan[]> {
    return (await this.http.get<CambioDto[]>(`${ruta(id)}/cambios`)).map(aCambio);
  }
}
