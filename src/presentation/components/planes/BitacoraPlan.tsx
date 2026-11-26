import type { AccionCambio, CambioPlan, EntidadCambio } from '../../../domain/entities/Plan';
import { useCambiosPlan, useUsuarios } from '../../hooks/consultas';
import { formatearFechaHora } from '../../utils/fechas';
import { Cargando } from '../common/Cargando';
import { MensajeError } from '../common/MensajeError';

const ACCIONES: Record<AccionCambio, string> = {
  crear: 'creó',
  actualizar: 'corrigió',
  eliminar: 'eliminó',
  importar: 'importó exámenes en',
  publicar: 'publicó',
  nuevaVersion: 'creó esta versión a partir de otra:',
};

const ENTIDADES: Record<EntidadCambio, string> = {
  plan: 'el plan',
  materia: 'una materia',
  clase: 'el contenido de una semana',
  examen: 'un examen',
};

/** Nombre de lo que cambió, si el registro lo trae (materia, tema o título). */
const nombreDe = (cambio: CambioPlan): string => {
  const datos = (cambio.despues ?? cambio.antes) as Record<string, unknown> | undefined;
  const nombre = datos && (datos.nombre ?? datos.tema ?? datos.titulo);
  return typeof nombre === 'string' ? `«${nombre}»` : '';
};

const Detalle = ({ titulo, valor }: { titulo: string; valor: unknown }) =>
  valor === undefined ? null : (
    <div className="space-y-1 min-w-0">
      <p className="text-[12px] font-bold text-on-surface-variant uppercase">{titulo}</p>
      <pre className="text-[12px] bg-surface-container-low rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
        {JSON.stringify(valor, null, 2)}
      </pre>
    </div>
  );

/** Historial de cambios del plan: quién cambió qué, cuándo, y cómo estaba antes. */
export const BitacoraPlan = ({ planId }: { planId: string }) => {
  const cambios = useCambiosPlan(planId);
  const usuarios = useUsuarios();
  const autor = (id: string) => usuarios.data?.find((u) => u.id === id)?.nombre ?? 'Alguien';

  if (cambios.isPending) return <Cargando texto="Cargando historial…" />;
  if (cambios.error) return <MensajeError error={cambios.error} alReintentar={() => void cambios.refetch()} />;
  if (cambios.data.length === 0) return <p className="text-body-sm text-on-surface-variant">Aún no hay cambios registrados.</p>;

  return (
    <ol className="space-y-2" aria-label="Historial de cambios">
      {cambios.data.map((c) => (
        <li key={c.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3">
          <details>
            <summary className="cursor-pointer text-body-sm text-on-surface">
              <span className="text-on-surface-variant">{formatearFechaHora(c.fecha)} · </span>
              <span className="font-bold">{autor(c.autorId)}</span> {ACCIONES[c.accion]} {ENTIDADES[c.entidad]} {nombreDe(c)}
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <Detalle titulo="Antes" valor={c.antes} />
              <Detalle titulo="Después" valor={c.despues} />
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
};
