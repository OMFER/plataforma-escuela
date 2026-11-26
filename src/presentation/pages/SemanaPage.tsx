import { Link } from 'react-router-dom';
import type { MateriaConMaestro } from '../../domain/entities/Materia';
import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { BotonGrabacion } from '../components/contenido/BotonGrabacion';
import { EncabezadoSemana } from '../components/contenido/EncabezadoSemana';
import { InfografiaSemana } from '../components/contenido/InfografiaSemana';
import { BotonExamen } from '../components/examen/BotonExamen';
import { APP_TEXTS } from '../constants/textos';
import { useContenidoSemana, useExamenesSemana } from '../hooks/consultas';
import { useParametrosSemana } from '../hooks/useParametrosGrupo';
import { rutas } from '../routes/rutas';
import { EXAMENES_POR_SEMANA } from '../../domain/entities/Plan';

interface SemanaDeMateriaProps {
  grupoId: string;
  materia: MateriaConMaestro;
  /** Semana de la materia (1 o 2). */
  semana: number;
}

/** Lo que el alumno ve de una materia en la semana: la infografía, la grabación y sus dos exámenes. */
const SemanaDeMateria = ({ grupoId, materia, semana }: SemanaDeMateriaProps) => {
  const contenido = useContenidoSemana(materia.id, semana);
  const examenes = useExamenesSemana(grupoId, materia.id, semana);

  return (
    <div className="space-y-section-gap">
      <p className="text-body-sm text-on-surface-variant">
        Semana {semana} de {materia.nombre}
        {materia.maestro?.nombre ? ` · ${materia.maestro.nombre}` : ''}
      </p>
      {contenido.isPending && <Cargando texto="Cargando contenido de la semana…" />}
      {contenido.error && <MensajeError error={contenido.error} alReintentar={() => void contenido.refetch()} />}
      {contenido.data === null && <EstadoVacio icono="hourglass_top" titulo={APP_TEXTS.semana.sinContenido} />}
      {contenido.data && <InfografiaSemana contenido={contenido.data} />}

      {examenes.error && <MensajeError error={examenes.error} alReintentar={() => void examenes.refetch()} />}

      <section
        aria-label="Acciones de la semana"
        className="border-t border-outline-variant pt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-4"
      >
        <BotonGrabacion url={contenido.data?.links?.grabacion} descripcion={contenido.data?.links?.descGrabacion} />
        {Array.from({ length: EXAMENES_POR_SEMANA }, (_, i) => i + 1).map((numero) => (
          <BotonExamen
            key={numero}
            grupoId={grupoId}
            examen={examenes.data?.find((e) => e.numero === numero) ?? null}
            cargando={examenes.isPending}
            nombre={`Examen ${numero}`}
            accion={`${APP_TEXTS.semana.hacerExamen} ${numero}`}
            textoSinExamen={APP_TEXTS.semana.sinExamen}
          />
        ))}
      </section>
    </div>
  );
};

export const SemanaPage = () => {
  const { grupoId, semana, grupo, materias, materia, semanaDeMateria } = useParametrosSemana();

  if (!Number.isInteger(semana) || semana < 1) {
    return (
      <main className="max-w-[1200px] mx-auto p-gutter">
        <EstadoVacio icono="error" titulo="La semana solicitada no es válida." />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-[1000px] mx-auto p-gutter py-8 space-y-8">
        <EncabezadoSemana grupoId={grupoId} semana={semana} grupo={grupo.data} />

        {grupo.isPending && <Cargando texto="Cargando grupo…" />}
        {grupo.error && <MensajeError error={grupo.error} alReintentar={() => void grupo.refetch()} />}
        {grupo.data === null && <EstadoVacio icono="search_off" titulo="No encontramos este grupo." />}
        {grupo.data && !materia && <EstadoVacio icono="event_busy" titulo="Esta semana no tiene materias." />}

        {materias.length > 1 && (
          <nav aria-label="Materias de la semana" className="flex border-b border-outline-variant overflow-x-auto">
            {materias.map((m) => {
              const activa = m.id === materia?.id;
              return (
                <Link
                  key={m.id}
                  to={rutas.semana(grupoId, semana, m.id)}
                  aria-current={activa ? 'page' : undefined}
                  className={`px-6 py-3 text-body-sm whitespace-nowrap border-b-2 transition-colors ${
                    activa ? 'text-primary font-bold border-primary' : 'text-on-surface-variant hover:text-primary border-transparent'
                  }`}
                >
                  {m.nombre}
                </Link>
              );
            })}
          </nav>
        )}

        {materia && <SemanaDeMateria key={materia.id} grupoId={grupoId} materia={materia} semana={semanaDeMateria} />}
      </div>
    </main>
  );
};
