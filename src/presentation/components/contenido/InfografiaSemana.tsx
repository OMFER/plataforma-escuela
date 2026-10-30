import type { ContenidoSemana } from '../../../domain/entities/Contenido';
import { RecursoItem } from './RecursoItem';

export const InfografiaSemana = ({ contenido }: { contenido: ContenidoSemana }) => (
  <article className="space-y-8">
    <header className="bg-secondary-container/30 border-l-4 border-primary p-6 rounded-r-xl space-y-3">
      <p className="text-label-caps font-label-caps text-primary uppercase">Tema de la semana</p>
      <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">{contenido.tema}</h2>
      {contenido.introduccion && (
        <p className="text-body-lg text-on-surface-variant whitespace-pre-line">{contenido.introduccion}</p>
      )}
    </header>

    {contenido.recursos.length > 0 && (
      <section className="space-y-4" aria-label="Recursos de la semana">
        <h3 className="text-title-md font-headline-lg text-on-surface">Recursos</h3>
        <ol className="space-y-4">
          {contenido.recursos.map((recurso, i) => (
            <li key={`${i}-${recurso.url}`}>
              <RecursoItem recurso={recurso} />
            </li>
          ))}
        </ol>
      </section>
    )}
  </article>
);
