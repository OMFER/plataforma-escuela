import type { EstadoPlan } from '../../../domain/entities/Plan';
import { ETIQUETAS_ESTADO_PLAN } from '../../constants/textos';

const ESTILOS: Record<EstadoPlan, string> = {
  borrador: 'bg-surface-container-highest text-on-surface-variant',
  publicado: 'bg-secondary-container text-on-secondary-container',
};

export const EtiquetaEstadoPlan = ({ estado }: { estado: EstadoPlan }) => (
  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${ESTILOS[estado]}`}>{ETIQUETAS_ESTADO_PLAN[estado]}</span>
);
