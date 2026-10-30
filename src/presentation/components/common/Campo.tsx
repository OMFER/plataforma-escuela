import type { ReactNode } from 'react';
import { estilos } from './estilos';

interface CampoProps {
  etiqueta: string;
  htmlFor: string;
  error?: string;
  ayuda?: string;
  children: ReactNode;
}

/** Envoltorio de un control de formulario: etiqueta, ayuda y mensaje de error. */
export const Campo = ({ etiqueta, htmlFor, error, ayuda, children }: CampoProps) => (
  <div>
    <label htmlFor={htmlFor} className={estilos.etiqueta}>
      {etiqueta}
    </label>
    {children}
    {ayuda && !error && <p className="mt-1 text-[12px] text-on-surface-variant">{ayuda}</p>}
    {error && (
      <p role="alert" className="mt-1 text-[12px] text-error">
        {error}
      </p>
    )}
  </div>
);
