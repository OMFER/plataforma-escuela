import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { esTipoExamen, type Examen } from '../../domain/entities/Examen';
import { preguntasIguales } from '../../domain/rules/examen';
import { AccionEliminar } from '../components/common/AccionEliminar';
import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { estilos } from '../components/common/estilos';
import { FormularioExamen } from '../components/examen/FormularioExamen';
import { TablaIntentos } from '../components/examen/TablaIntentos';
import {
  aDatosGenerales,
  aPreguntasNuevas,
  aTipoYSemana,
  valoresInicialesExamen,
  type FormularioExamenValores,
} from '../components/examen/esquemaExamen';
import { NOMBRE_TIPO_EXAMEN } from '../constants/textos';
import { claves, useExamen, useExamenesGrupo, useIntentosExamen } from '../hooks/consultas';
import { useGrupoDeRuta } from '../hooks/useParametrosGrupo';
import { useCasosDeUso } from '../providers/DependenciasContext';
import { rutas } from '../routes/rutas';
import { describirVentana } from '../utils/ventana';

interface EstadoNavegacion {
  aviso?: string;
}

/** Crea (`/examenes/nuevo?tipo=&semana=`) o edita (`/examenes/:id/editar`) un examen de la materia del grupo. */
export const EditorExamenPage = () => {
  const { grupoId, grupo } = useGrupoDeRuta();
  const { examenId } = useParams<{ examenId?: string }>();
  const [busqueda] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { crearExamen, actualizarExamen, eliminarExamen } = useCasosDeUso();
  const examen = useExamen(examenId);
  const intentos = useIntentosExamen(grupoId, examenId);
  const resumenes = useExamenesGrupo(grupoId);
  const [aviso, setAviso] = useState<string | null>(null);

  const esNuevo = !examenId;
  const tipoPedido = busqueda.get('tipo');
  const nuevo = {
    tipo: esTipoExamen(tipoPedido) ? tipoPedido : 'Semanal',
    semana: Math.max(Number(busqueda.get('semana')) || 1, 1),
  } as const;
  const tipo = examen.data?.tipo ?? nuevo.tipo;
  const semana = examen.data?.semana ?? nuevo.semana;
  const volver =
    tipo === 'Final'
      ? { ruta: rutas.inicio, texto: 'Volver al inicio' }
      : { ruta: rutas.semana(grupoId, semana), texto: `Volver a la semana ${semana}` };
  const resumen = resumenes.data?.find((e) => e.id === examenId);
  const avisoVisible = aviso ?? (location.state as EstadoNavegacion | null)?.aviso ?? null;

  const refrescarGrupos = () => queryClient.invalidateQueries({ queryKey: claves.grupos });

  const guardado = useMutation({
    mutationFn: (valores: FormularioExamenValores): Promise<Examen> => {
      const generales = aDatosGenerales(valores);
      const preguntas = aPreguntasNuevas(valores.preguntas);
      const actual = examen.data;
      if (!actual) {
        return crearExamen.ejecutar({ materiaId: grupo.data?.materia.id ?? '', ...aTipoYSemana(valores), ...generales, preguntas });
      }
      // Solo se envían las preguntas si cambiaron: así se puede editar el resto aunque ya haya intentos.
      const cambiaron = !preguntasIguales(preguntas, actual.preguntas);
      return actualizarExamen.ejecutar(actual.id, { ...generales, ...(cambiaron ? { preguntas } : {}) });
    },
    onMutate: () => setAviso(null),
    onSuccess: (guardadoNuevo) => {
      queryClient.setQueryData(claves.examen(guardadoNuevo.id), guardadoNuevo);
      void refrescarGrupos();
      if (esNuevo) {
        navigate(rutas.editarExamen(grupoId, guardadoNuevo.id), {
          replace: true,
          state: { aviso: 'Examen creado correctamente.' } satisfies EstadoNavegacion,
        });
      } else {
        setAviso('Examen guardado correctamente.');
      }
    },
  });

  const cargando = grupo.isPending || (!esNuevo && examen.isPending);

  return (
    <main className="min-h-screen">
      <div className="max-w-[900px] mx-auto p-gutter py-8 space-y-8">
        <section className="space-y-4">
          <Link to={volver.ruta} className={estilos.enlaceVolver}>
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {volver.texto}
          </Link>
          {grupo.data && (
            <p className="text-title-md text-primary">
              {grupo.data.materia.nombre}
              <span className="text-body-sm text-on-surface-variant font-normal"> · Grupo {grupo.data.nombre} · {grupo.data.periodo}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">
              {esNuevo ? 'Nuevo examen' : `Editar ${NOMBRE_TIPO_EXAMEN[tipo].toLowerCase()}`}
            </h1>
            {examen.data && (
              <AccionEliminar
                etiqueta="Eliminar examen"
                titulo="¿Eliminar este examen?"
                alEliminar={() => eliminarExamen.ejecutar(examen.data?.id ?? '')}
                alEliminado={() => {
                  void refrescarGrupos();
                  navigate(volver.ruta);
                }}
              >
                <p>
                  Se borrará el examen de la materia junto con las respuestas y calificaciones de los alumnos en todos los
                  grupos. Esta acción no se puede deshacer.
                </p>
              </AccionEliminar>
            )}
          </div>
          {resumen && (
            <p className="text-body-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">event</span>
              En este grupo: {describirVentana(resumen.ventana)}
            </p>
          )}
        </section>

        {cargando && <Cargando />}
        {grupo.error && <MensajeError error={grupo.error} alReintentar={() => void grupo.refetch()} />}
        {examen.error && <MensajeError error={examen.error} alReintentar={() => void examen.refetch()} />}
        {!esNuevo && examen.data === null && <EstadoVacio icono="search_off" titulo="No encontramos este examen." />}
        {avisoVisible && (
          <p role="status" className="bg-secondary-container/30 border-l-4 border-primary p-3 rounded-r-lg text-body-sm">
            {avisoVisible}
          </p>
        )}

        {grupo.data && (esNuevo || examen.data) && (
          <FormularioExamen
            key={examen.data?.id ?? 'nuevo'}
            valoresIniciales={valoresInicialesExamen(examen.data ?? null, nuevo)}
            totalSemanas={grupo.data.materia.totalSemanas}
            esNuevo={esNuevo}
            tieneIntentos={(intentos.data?.length ?? 0) > 0}
            error={guardado.error}
            guardando={guardado.isPending}
            alGuardar={(valores) => guardado.mutate(valores)}
            alCancelar={() => navigate(volver.ruta)}
          />
        )}

        {examen.data && (
          <section className="space-y-4" aria-labelledby="titulo-resultados">
            <h2 id="titulo-resultados" className="text-title-md font-headline-lg text-on-surface">
              Resultados de este grupo
            </h2>
            {intentos.isPending && <Cargando texto="Cargando resultados…" />}
            {intentos.error && <MensajeError error={intentos.error} alReintentar={() => void intentos.refetch()} />}
            {intentos.data && <TablaIntentos intentos={intentos.data} puntajeMaximo={examen.data.puntajeMaximo} />}
          </section>
        )}
      </div>
    </main>
  );
};
