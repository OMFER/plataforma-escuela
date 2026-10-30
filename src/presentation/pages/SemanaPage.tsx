import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { AccionesMaestro } from '../components/contenido/AccionesMaestro';
import { BotonGrabacion } from '../components/contenido/BotonGrabacion';
import { EncabezadoSemana } from '../components/contenido/EncabezadoSemana';
import { InfografiaSemana } from '../components/contenido/InfografiaSemana';
import { BotonExamen } from '../components/examen/BotonExamen';
import { APP_TEXTS } from '../constants/textos';
import { useContenidoSemana, useExamenesSemana } from '../hooks/consultas';
import { useParametrosSemana } from '../hooks/useParametrosGrupo';
import { useUsuarioActual } from '../providers/SesionContext';

export const SemanaPage = () => {
  const usuario = useUsuarioActual();
  const { grupoId, semana, grupo, materiaId } = useParametrosSemana();
  const contenido = useContenidoSemana(materiaId, semana);
  const examenes = useExamenesSemana(grupoId, semana);
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
        <EncabezadoSemana grupoId={grupoId} semana={semana} grupo={grupo.data} />

        {grupo.isPending && <Cargando texto="Cargando grupo…" />}
        {grupo.error && <MensajeError error={grupo.error} alReintentar={() => void grupo.refetch()} />}
        {grupo.data === null && <EstadoVacio icono="search_off" titulo="No encontramos este grupo." />}

        {grupo.data && (
          <>
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
              {esMaestro ? (
                <AccionesMaestro
                  grupoId={grupoId}
                  semana={semana}
                  hayContenido={Boolean(contenido.data)}
                  examenes={examenes.data}
                />
              ) : (
                <>
                  <BotonExamen
                    grupoId={grupoId}
                    examen={examenes.data?.semanal}
                    cargando={examenes.isPending}
                    nombre="Examen semanal"
                    accion={APP_TEXTS.semana.hacerExamen}
                    textoSinExamen={APP_TEXTS.semana.sinExamen}
                  />
                  <BotonExamen
                    grupoId={grupoId}
                    examen={examenes.data?.reposicion}
                    cargando={examenes.isPending}
                    nombre="Reposición"
                    accion={APP_TEXTS.semana.hacerReposicion}
                    textoSinExamen={APP_TEXTS.semana.sinReposicion}
                    icono="restart_alt"
                  />
                </>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};
