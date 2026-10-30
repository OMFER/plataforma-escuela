export const Cargando = ({ texto = 'Cargando…' }: { texto?: string }) => (
  <div role="status" className="flex items-center gap-3 py-8 text-on-surface-variant">
    <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
    <span className="text-body-sm">{texto}</span>
  </div>
);
