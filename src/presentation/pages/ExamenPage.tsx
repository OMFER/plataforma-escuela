import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ResultadoIntento } from '../../domain/entities/Examen';
import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { estilos } from '../components/common/estilos';
import { FormularioRespuestas } from '../components/examen/FormularioRespuestas';
import { ResultadoExamen } from '../components/examen/ResultadoExamen';
import { useExamen } from '../hooks/consultas';
import { rutas } from '../routes/rutas';
import { formatearFechaHora } from '../utils/fechas';

export const ExamenPage = () => {
  const { examenId = '' } = useParams<{ examenId: string }>();
  const { data: examen, isPending, error, refetch } = useExamen(examenId);
  const [resultadoNuevo, setResultadoNuevo] = useState<ResultadoIntento | null>(null);

  const volver = examen?.semana ? rutas.semana(examen.materiaId, examen.semana) : rutas.inicio;
  const resultado = resultadoNuevo ?? examen?.miIntento ?? null;

  return (
    <main className="min-h-screen">
      <div className="max-w-[900px] mx-auto p-gutter py-8 space-y-8">
        <Link to={volver} className={estilos.enlaceVolver}>
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          {examen?.semana ? `Volver a la semana ${examen.semana}` : 'Volver al inicio'}
        </Link>

        {isPending && <Cargando texto="Cargando examen…" />}
        {error && <MensajeError error={error} alReintentar={() => void refetch()} />}
        {examen === null && <EstadoVacio icono="search_off" titulo="No encontramos este examen." />}

        {examen && (
          <>
            <header className="space-y-2">
              <p className="text-label-caps font-label-caps text-primary uppercase">
                Examen {examen.tipo === 'PuntoExtra' ? 'de punto extra' : examen.tipo.toLowerCase()}
              </p>
              <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">{examen.titulo}</h1>
              {examen.descripcion && <p className="text-body-lg text-on-surface-variant whitespace-pre-line">{examen.descripcion}</p>}
              <div className="flex flex-wrap gap-4 text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">help</span>
                  {examen.preguntas.length || resultado?.totalPreguntas || 0} preguntas
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">grade</span>
                  Puntaje máximo: {examen.puntajeMaximo}
                </span>
                {examen.fechaLimite && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">event</span>
                    Fecha límite: {formatearFechaHora(examen.fechaLimite)}
                  </span>
                )}
              </div>
            </header>

            {resultado ? (
              <ResultadoExamen resultado={resultado} puntajeMaximo={examen.puntajeMaximo} />
            ) : examen.preguntas.length === 0 ? (
              <EstadoVacio icono="quiz" titulo="Este examen aún no tiene preguntas." />
            ) : (
              <FormularioRespuestas examen={examen} alTerminar={setResultadoNuevo} />
            )}
          </>
        )}
      </div>
    </main>
  );
};
