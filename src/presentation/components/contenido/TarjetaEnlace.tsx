import type { Recurso } from '../../../domain/entities/Contenido';
import { esUrlHttp } from '../../../domain/rules/urls';

const ICONOS: Record<Recurso['tipo'], string> = {
  pdf: 'picture_as_pdf',
  web: 'language',
  youtube: 'smart_display',
};

const ETIQUETAS: Record<Recurso['tipo'], string> = {
  pdf: 'Documento PDF',
  web: 'Sitio web',
  youtube: 'Video de YouTube',
};

export const TarjetaEnlace = ({ recurso }: { recurso: Recurso }) => (
  <a
    href={esUrlHttp(recurso.url) ? recurso.url : undefined}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-start gap-4 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant hover:border-primary/40 hover:shadow-md transition-all"
  >
    <div className="w-12 h-12 rounded-lg bg-secondary-container/50 flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-primary" aria-hidden="true">
        {ICONOS[recurso.tipo]}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-label-caps font-label-caps text-on-surface-variant uppercase">{ETIQUETAS[recurso.tipo]}</p>
      <p className="text-title-md text-on-surface group-hover:text-primary transition-colors">{recurso.titulo}</p>
      {recurso.descripcion && <p className="text-body-sm text-on-surface-variant mt-1">{recurso.descripcion}</p>}
    </div>
    <span className="material-symbols-outlined text-outline group-hover:text-primary" aria-hidden="true">
      open_in_new
    </span>
  </a>
);
