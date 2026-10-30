import type { ReactNode } from 'react';
import { estilos } from './estilos';

interface ConfirmDialogProps {
  abierto: boolean;
  titulo: string;
  children: ReactNode;
  textoConfirmar: string;
  textoOcupado?: string;
  /** Pinta el botón de confirmar en rojo (acciones que borran datos). */
  peligroso?: boolean;
  ocupado?: boolean;
  alConfirmar: () => void;
  alCancelar: () => void;
}

export const ConfirmDialog = ({
  abierto,
  titulo,
  children,
  textoConfirmar,
  textoOcupado = 'Enviando…',
  peligroso = false,
  ocupado = false,
  alConfirmar,
  alCancelar,
}: ConfirmDialogProps) => {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/50 p-gutter">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4"
      >
        <h2 id="confirmar-titulo" className="text-title-md font-headline-lg text-on-surface">
          {titulo}
        </h2>
        <div className="text-body-sm text-on-surface-variant space-y-3">{children}</div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className={estilos.botonSecundario} onClick={alCancelar} disabled={ocupado}>
            Cancelar
          </button>
          <button
            type="button"
            className={peligroso ? estilos.botonPeligroLleno : estilos.botonPrimario}
            onClick={alConfirmar}
            disabled={ocupado}
          >
            {ocupado ? textoOcupado : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};
