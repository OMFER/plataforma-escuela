import type { ReactNode } from 'react';

interface EstadoVacioProps {
  icono?: string;
  titulo: string;
  children?: ReactNode;
}

export const EstadoVacio = ({ icono = 'hourglass_empty', titulo, children }: EstadoVacioProps) => (
  <div className="bg-secondary-container/30 border border-secondary-container rounded-xl p-8 flex flex-col items-center text-center gap-3">
    <span className="material-symbols-outlined text-primary text-[40px]">{icono}</span>
    <p className="text-title-md text-on-surface">{titulo}</p>
    {children}
  </div>
);
