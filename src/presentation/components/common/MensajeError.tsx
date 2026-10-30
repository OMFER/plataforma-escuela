import { esErrorAplicacion, mensajeDeError } from '../../../domain/errors/ErrorAplicacion';

interface MensajeErrorProps {
  error: unknown;
  alReintentar?: () => void;
}

export const MensajeError = ({ error, alReintentar }: MensajeErrorProps) => {
  const mensajes = esErrorAplicacion(error) ? error.mensajes : [mensajeDeError(error)];
  return (
    <div role="alert" className="bg-error-container/40 border-l-4 border-error p-4 rounded-r-xl flex items-start gap-3">
      <span className="material-symbols-outlined text-error">error</span>
      <div className="flex-1 space-y-1">
        {mensajes.map((m) => (
          <p key={m} className="text-body-sm text-on-surface">
            {m}
          </p>
        ))}
        {alReintentar && (
          <button type="button" onClick={alReintentar} className="text-primary font-bold text-body-sm underline">
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};
