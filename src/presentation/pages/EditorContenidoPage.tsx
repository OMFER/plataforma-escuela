import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { esSemanaDeMateria } from '../../domain/rules/examen';
import { AccionEliminar } from '../components/common/AccionEliminar';
import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { FormularioContenido } from '../components/contenido/FormularioContenido';
import { aCambiosContenido, type FormularioContenidoValores } from '../components/contenido/esquemaContenido';
import { AvisoPlanPublicado, EncabezadoMateria } from '../components/materia/EncabezadoMateria';
import { claves, useContenidoSemana } from '../hooks/consultas';
import { useMateriaDeRuta } from '../hooks/useParametrosGrupo';
import { useCasosDeUso } from '../providers/DependenciasContext';
import { rutas } from '../routes/rutas';

/** Crea o corrige el contenido de una semana (1 o 2) de la materia; el cambio lo ven todos los grupos. */
export const EditorContenidoPage = () => {
  const { materiaId, materia } = useMateriaDeRuta();
  const semana = Number(useParams<{ semana: string }>().semana);
  const { guardarContenidoSemana, eliminarContenidoSemana } = useCasosDeUso();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const contenido = useContenidoSemana(materiaId, semana);
  const volver = rutas.materia(materiaId);
  const enBorrador = materia.data?.plan.estado === 'borrador';
  const refrescarMateria = () => queryClient.invalidateQueries({ queryKey: claves.datosMateria(materiaId) });

  const guardado = useMutation({
    mutationFn: (valores: FormularioContenidoValores) =>
      guardarContenidoSemana.ejecutar({
        id: contenido.data?.id,
        materiaId,
        semana,
        datos: aCambiosContenido(valores, contenido.data ?? null),
      }),
    onSuccess: () => {
      void refrescarMateria();
      navigate(volver);
    },
  });

  if (!esSemanaDeMateria(semana)) {
    return (
      <main className="max-w-[900px] mx-auto p-gutter">
        <EstadoVacio icono="error" titulo="Cada materia tiene solo las semanas 1 y 2." />
      </main>
    );
  }

  const existente = contenido.data;

  return (
    <main className="min-h-screen">
      <div className="max-w-[900px] mx-auto p-gutter py-8 space-y-8">
        <header className="space-y-3">
          {materia.data && <EncabezadoMateria materia={materia.data} />}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">
              {existente ? 'Editar' : 'Crear'} contenido · Semana {semana}
            </h1>
            {existente && enBorrador && (
              <AccionEliminar
                etiqueta="Eliminar contenido"
                titulo="¿Eliminar el contenido de esta semana?"
                alEliminar={() => eliminarContenidoSemana.ejecutar(existente.id)}
                alEliminado={() => {
                  void refrescarMateria();
                  navigate(volver);
                }}
              >
                <p>Se borrarán el tema, la introducción, los recursos y la liga de la clase grabada de la semana {semana}.</p>
              </AccionEliminar>
            )}
          </div>
          {materia.data && !enBorrador && <AvisoPlanPublicado />}
        </header>

        {(materia.isPending || contenido.isPending) && <Cargando />}
        {materia.error && <MensajeError error={materia.error} alReintentar={() => void materia.refetch()} />}
        {contenido.error && <MensajeError error={contenido.error} alReintentar={() => void contenido.refetch()} />}
        {materia.data && contenido.data !== undefined && (
          <FormularioContenido
            key={contenido.data?.id ?? 'nuevo'}
            inicial={contenido.data}
            error={guardado.error}
            guardando={guardado.isPending}
            alGuardar={(valores) => guardado.mutate(valores)}
            alCancelar={() => navigate(volver)}
          />
        )}
      </div>
    </main>
  );
};
