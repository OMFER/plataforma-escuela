import type { CambioPlan, NuevoPlan, Plan, PlanDetallado, RevisionPlan } from '../entities/Plan';

/** Versiones del plan de estudios (solo admin). */
export interface PlanesRepository {
  listar(): Promise<Plan[]>;
  obtener(id: string): Promise<PlanDetallado | null>;
  crear(datos: NuevoPlan): Promise<Plan>;
  actualizar(id: string, cambios: { descripcion: string }): Promise<Plan>;
  /** Falla con 409 si algún grupo usa el plan. */
  eliminar(id: string): Promise<void>;
  revisar(id: string): Promise<RevisionPlan>;
  /** Falla con 400 y la lista de pendientes si el plan está incompleto. */
  publicar(id: string): Promise<Plan>;
  /** Copia la versión a un borrador nuevo con el siguiente número. */
  crearNuevaVersion(id: string): Promise<Plan>;
  listarCambios(id: string): Promise<CambioPlan[]>;
}
