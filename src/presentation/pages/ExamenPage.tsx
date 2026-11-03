import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ExamenGrupo, ResultadoConRevision } from '../../domain/entities/Examen';
import { revisionDe } from '../../domain/rules/examen';
import { estadoDeVentana } from '../../domain/rules/ventana';
import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { estilos } from '../components/common/estilos';
import { FormularioRespuestas } from '../components/examen/FormularioRespuestas';
import { ResultadoExamen } from '../components/examen/ResultadoExamen';
import { RevisionExamen } from '../components/examen/RevisionExamen';
import { APP_TEXTS, NOMBRE_TIPO_EXAMEN } from '../constants/textos';
import { useBotonVolver } from '../providers/BotonVolverContext';
import { useExamenGrupo } from '../hooks/consultas';
import { rutas } from '../routes/rutas';
import { formatearFechaHora } from '../utils/fechas';
import { irArribaDeLaPagina } from '../utils/scroll';
import { describirVentana } from '../utils/ventana';

interface ContenidoExamenProps {
  grupoId: string;
  examen: ExamenGrupo;
  alRecargar: () => void;
}

/** Decide qué ve el alumno: revisión (si ya respondió), aviso de ventana o el formulario para responder. */
const ContenidoExamen = ({ grupoId, examen, alRecargar }: ContenidoExamenProps) => {
  const [resultadoNuevo, setResultadoNuevo] = useState<ResultadoConRevision | null>(null);

  if (resultadoNuevo) {
    return (
      <>
        <ResultadoExamen resultado={resultadoNuevo} puntajeMaximo={examen.puntajeMaximo} />
        <RevisionExamen preguntas={resultadoNuevo.revision} cierra={resultadoNuevo.ventana?.cierra ?? examen.ventana.cierra} />
      </>
    );
  }

  if (examen.miIntento) {
    const revision = revisionDe(examen.preguntas);
    return (
      <>
        <ResultadoExamen resultado={examen.miIntento} puntajeMaximo={examen.puntajeMaximo} />
        {revision.length > 0 ? (
          <RevisionExamen preguntas={revision} cierra={examen.ventana.cierra} />
        ) : (
          <p className="text-body-sm text-on-surface-variant">La revisión de este examen no está disponible por ahora.</p>
        )}
      </>
    );
  }

  const estado = estadoDeVentana(examen.ventana);
  if (estado === 'proxima') {
    return (
      <EstadoVacio icono="schedule" titulo="Este examen todavía no abre">
        <p className="text-body-lg text-on-surface-variant">
          Podrás responderlo a partir del {formatearFechaHora(examen.ventana.abre)}.
        </p>
      </EstadoVacio>
    );
  }
  if (estado === 'cerrada') {
    return (
      <EstadoVacio icono="lock" titulo="Este examen ya cerró">
        <p className="text-body-lg text-on-surface-variant">
          Cerró el {formatearFechaHora(examen.ventana.cierra)} y ya no es posible responderlo.
        </p>
      </EstadoVacio>
    );
  }
  if (examen.preguntas.length === 0) {
    return (
      <EstadoVacio icono="quiz" titulo="Las preguntas aún no están disponibles.">
        <button type="button" className={estilos.botonSecundario} onClick={alRecargar}>
          Volver a cargar
        </button>
      </EstadoVacio>
    );
  }
  return (
    <FormularioRespuestas
      grupoId={grupoId}
      examen={examen}
      alTerminar={(resultado) => {
        setResultadoNuevo(resultado);
        // Tras enviar, la calificación y la revisión se leen desde arriba.
        irArribaDeLaPagina();
      }}
    />
  );
};

export const ExamenPage = () => {
  const { grupoId = '', examenId = '' } = useParams<{ grupoId: string; examenId: string }>();
  const { data: examen, isPending, error, refetch } = useExamenGrupo(grupoId, examenId);

  useBotonVolver(
    examen?.semana
      ? { ruta: rutas.semana(grupoId, examen.semana), texto: APP_TEXTS.nav.volverSemana(examen.semana) }
      : { ruta: rutas.inicio, texto: APP_TEXTS.nav.volverInicio },
  );

  return (
    <main className="min-h-screen">
      <div className="max-w-[900px] mx-auto p-gutter py-8 space-y-8">
        {isPending && <Cargando texto="Cargando examen…" />}
        {error && <MensajeError error={error} alReintentar={() => void refetch()} />}
        {examen === null && <EstadoVacio icono="search_off" titulo="No encontramos este examen." />}

        {examen && (
          <>
            <header className="space-y-2">
              <p className="text-label-caps font-label-caps text-primary uppercase">
                {NOMBRE_TIPO_EXAMEN[examen.tipo]}
                {examen.semana ? ` · Semana ${examen.semana}` : ''}
              </p>
              <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">{examen.titulo}</h1>
              {examen.descripcion && <p className="text-body-lg text-on-surface-variant whitespace-pre-line">{examen.descripcion}</p>}
              <div className="flex flex-wrap gap-4 text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">help</span>
                  {examen.totalPreguntas || examen.preguntas.length} preguntas
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">grade</span>
                  Puntaje máximo: {examen.puntajeMaximo}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">event</span>
                  {describirVentana(examen.ventana)}
                </span>
              </div>
            </header>

            <ContenidoExamen key={examen.id} grupoId={grupoId} examen={examen} alRecargar={() => void refetch()} />
          </>
        )}
      </div>
    </main>
  );
};
