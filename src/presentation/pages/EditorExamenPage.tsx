import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Examen } from '../../domain/entities/Examen';
import { esNumeroDeExamen, esSemanaDeMateria, preguntasIguales } from '../../domain/rules/examen';
import { AccionEliminar } from '../components/common/AccionEliminar';
import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { FormularioExamen } from '../components/examen/FormularioExamen';
import {
  aDatosGenerales,
  aPreguntasNuevas,
  valoresInicialesExamen,
  type FormularioExamenValores,
} from '../components/examen/esquemaExamen';
import { AvisoPlanPublicado, EncabezadoMateria } from '../components/materia/EncabezadoMateria';
import { claves, useExamen } from '../hooks/consultas';
import { useMateriaDeRuta } from '../hooks/useParametrosGrupo';
import { useCasosDeUso } from '../providers/DependenciasContext';
import { rutas } from '../routes/rutas';

interface EstadoNavegacion {
  aviso?: string;
}

const numeroPedido = (texto: string | null, valido: (n: number) => boolean): number => {
  const n = Number(texto);
  return valido(n) ? n : 1;
};

/** Crea (`/examenes/nuevo?semana=&numero=`) o corrige (`/examenes/:id/editar`) un examen de la materia. */
export const EditorExamenPage = () => {
  const { materiaId, materia } = useMateriaDeRuta();
  const { examenId } = useParams<{ examenId?: string }>();
  const [busqueda] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { crearExamen, actualizarExamen, eliminarExamen } = useCasosDeUso();
  const examen = useExamen(examenId);
  const [aviso, setAviso] = useState<string | null>(null);

  const esNuevo = !examenId;
  const nuevo = {
    semana: numeroPedido(busqueda.get('semana'), esSemanaDeMateria),
    numero: numeroPedido(busqueda.get('numero'), esNumeroDeExamen),
  };
  const volver = rutas.materia(materiaId);
  const enBorrador = materia.data?.plan.estado === 'borrador';
  const avisoVisible = aviso ?? (location.state as EstadoNavegacion | null)?.aviso ?? null;
  const refrescarMateria = () => queryClient.invalidateQueries({ queryKey: claves.datosMateria(materiaId) });

  const guardado = useMutation({
    mutationFn: (valores: FormularioExamenValores): Promise<Examen> => {
      const generales = aDatosGenerales(valores);
      const preguntas = aPreguntasNuevas(valores.preguntas);
      const actual = examen.data;
      if (!actual) {
        return crearExamen.ejecutar({ materiaId, semana: valores.semana, numero: valores.numero, ...generales, preguntas });
      }
      // Solo se envían las preguntas si cambiaron.
      const cambiaron = !preguntasIguales(preguntas, actual.preguntas);
      return actualizarExamen.ejecutar(actual.id, { ...generales, ...(cambiaron ? { preguntas } : {}) });
    },
    onMutate: () => setAviso(null),
    onSuccess: (guardadoNuevo) => {
      queryClient.setQueryData(claves.examen(guardadoNuevo.id), guardadoNuevo);
      void refrescarMateria();
      // Los grupos muestran el título del examen
      void queryClient.invalidateQueries({ queryKey: claves.grupos });
      if (esNuevo) {
        navigate(rutas.editarExamen(materiaId, guardadoNuevo.id), {
          replace: true,
          state: { aviso: 'Examen creado correctamente.' } satisfies EstadoNavegacion,
        });
      } else {
        setAviso('Examen guardado correctamente.');
      }
    },
  });

  const cargando = materia.isPending || (!esNuevo && examen.isPending);

  return (
    <main className="min-h-screen">
      <div className="max-w-[900px] mx-auto p-gutter py-8 space-y-8">
        <section className="space-y-3">
          {materia.data && <EncabezadoMateria materia={materia.data} />}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">
              {esNuevo ? 'Nuevo examen' : 'Editar examen'}
            </h1>
            {examen.data && enBorrador && (
              <AccionEliminar
                etiqueta="Eliminar examen"
                titulo="¿Eliminar este examen?"
                alEliminar={() => eliminarExamen.ejecutar(examen.data?.id ?? '')}
                alEliminado={() => {
                  void refrescarMateria();
                  navigate(volver);
                }}
              >
                <p>Se borrará el examen de la materia. Esta acción no se puede deshacer.</p>
              </AccionEliminar>
            )}
          </div>
          {materia.data && !enBorrador && <AvisoPlanPublicado />}
        </section>

        {cargando && <Cargando />}
        {materia.error && <MensajeError error={materia.error} alReintentar={() => void materia.refetch()} />}
        {examen.error && <MensajeError error={examen.error} alReintentar={() => void examen.refetch()} />}
        {!esNuevo && examen.data === null && <EstadoVacio icono="search_off" titulo="No encontramos este examen." />}

        {materia.data && (esNuevo || examen.data) && (
          <FormularioExamen
            key={examen.data?.id ?? 'nuevo'}
            valoresIniciales={valoresInicialesExamen(examen.data ?? null, nuevo)}
            esNuevo={esNuevo}
            soloRedaccion={examen.data?.tieneRespuestas ?? false}
            error={guardado.error}
            aviso={avisoVisible}
            guardando={guardado.isPending}
            alGuardar={(valores) => guardado.mutate(valores)}
            alCancelar={() => navigate(volver)}
          />
        )}
      </div>
    </main>
  );
};
