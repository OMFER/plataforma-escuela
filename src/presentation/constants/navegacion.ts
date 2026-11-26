import type { Rol } from '../../domain/entities/Usuario';
import { rutas } from '../routes/rutas';

export interface ElementoNavegacion {
  path: string;
  label: string;
  icon: string;
}

const NAVEGACION: Record<Rol, ElementoNavegacion[]> = {
  alumno: [{ path: rutas.inicio, label: 'Mis materias', icon: 'calendar_month' }],
  maestro: [{ path: rutas.inicio, label: 'Mis grupos', icon: 'calendar_month' }],
  admin: [{ path: rutas.admin, label: 'Administración', icon: 'admin_panel_settings' }],
};

export const navegacionPorRol = (rol: Rol): ElementoNavegacion[] => NAVEGACION[rol];

/** id del menú lateral, para que el botón de hamburguesa lo referencie (aria-controls). */
export const ID_MENU_LATERAL = 'menu-lateral';

/**
 * El menú lateral (con su botón de hamburguesa) está apagado por ahora.
 * Su código se conserva: para volver a mostrarlo basta con cambiar esto a `true`.
 */
export const MENU_LATERAL_HABILITADO = false;
