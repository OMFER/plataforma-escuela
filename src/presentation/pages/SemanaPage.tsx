import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { AccionesMaestro } from '../components/contenido/AccionesMaestro';
import { BotonGrabacion } from '../components/contenido/BotonGrabacion';
import { EncabezadoSemana } from '../components/contenido/EncabezadoSemana';
import { InfografiaSemana } from '../components/contenido/InfografiaSemana';
import { AccionExamenAlumno } from '../components/examen/AccionExamenAlumno';
import { APP_TEXTS } from '../constants/textos';
import { useContenidoSemana, useExamenSemana } from '../hooks/consultas';
import { useParametrosSemana } from '../hooks/useParametrosSemana';
import { useUsuarioActual } from '../providers/SesionContext';

export const SemanaPage = () => {
  const usuario = useUsuarioActual();
  const { materiaId, semana, materia } = useParametrosSemana();
  const contenido = useContenidoSemana(materiaId, semana);
  const examen = useExamenSemana(materiaId, semana);
  const esMaestro = usuario.rol === 'maestro';

  if (!Number.isInteger(semana) || semana < 1) {
    return (
      <main className="max-w-[1200px] mx-auto p-gutter">
        <EstadoVacio icono="error" titulo="La semana solicitada no es válida." />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-[1000px] mx-auto p-gutter py-8 space-y-section-gap">
        <EncabezadoSemana materiaId={materiaId} semana={semana} materia={materia} />

        {contenido.isPending && <Cargando texto="Cargando contenido de la semana…" />}
        {contenido.error && <MensajeError error={contenido.error} alReintentar={() => void contenido.refetch()} />}
        {contenido.data === null && <EstadoVacio icono="hourglass_top" titulo={APP_TEXTS.semana.sinContenido} />}
        {contenido.data && <InfografiaSemana contenido={contenido.data} />}

        {examen.error && <MensajeError error={examen.error} alReintentar={() => void examen.refetch()} />}

        <section
          aria-label="Acciones de la semana"
          className="border-t border-outline-variant pt-8 flex flex-col sm:flex-row sm:items-start gap-4"
        >
          <BotonGrabacion url={contenido.data?.links?.grabacion} descripcion={contenido.data?.links?.descGrabacion} />
          {!esMaestro && <AccionExamenAlumno examen={examen.data} cargando={examen.isPending} />}
          {esMaestro && (
            <AccionesMaestro
              materiaId={materiaId}
              semana={semana}
              hayContenido={Boolean(contenido.data)}
              hayExamen={Boolean(examen.data)}
            />
          )}
        </section>
      </div>
    </main>
  );
};
