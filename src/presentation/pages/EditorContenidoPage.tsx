import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AccionEliminar } from '../components/common/AccionEliminar';
import { Cargando } from '../components/common/Cargando';
import { MensajeError } from '../components/common/MensajeError';
import { EncabezadoSemana } from '../components/contenido/EncabezadoSemana';
import { FormularioContenido } from '../components/contenido/FormularioContenido';
import { aCambiosContenido, type FormularioContenidoValores } from '../components/contenido/esquemaContenido';
import { claves, useContenidoSemana } from '../hooks/consultas';
import { useParametrosSemana } from '../hooks/useParametrosGrupo';
import { useCasosDeUso } from '../providers/DependenciasContext';
import { rutas } from '../routes/rutas';

export const EditorContenidoPage = () => {
  const { grupoId, semana, grupo, materiaId } = useParametrosSemana();
  const { guardarContenidoSemana, eliminarContenidoSemana } = useCasosDeUso();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const contenido = useContenidoSemana(materiaId, semana);
  const volver = rutas.semana(grupoId, semana);

  const guardado = useMutation({
    mutationFn: (valores: FormularioContenidoValores) =>
      guardarContenidoSemana.ejecutar({
        id: contenido.data?.id,
        materiaId,
        semana,
        datos: aCambiosContenido(valores, contenido.data ?? null),
      }),
    onSuccess: (guardadoNuevo) => {
      queryClient.setQueryData(claves.contenidoSemana(materiaId, semana), guardadoNuevo);
      navigate(volver);
    },
  });

  const existente = contenido.data;

  return (
    <main className="min-h-screen">
      <div className="max-w-[900px] mx-auto p-gutter py-8 space-y-8">
        <EncabezadoSemana
          grupoId={grupoId}
          semana={semana}
          grupo={grupo.data}
          volverA={{ ruta: volver, texto: `Volver a la semana ${semana}` }}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-title-md font-headline-lg text-on-surface">
            {existente ? 'Editar contenido de la semana' : 'Crear contenido de la semana'}
          </h2>
          {existente && (
            <AccionEliminar
              etiqueta="Eliminar contenido"
              titulo="¿Eliminar el contenido de esta semana?"
              alEliminar={() => eliminarContenidoSemana.ejecutar(existente.id)}
              alEliminado={() => {
                queryClient.setQueryData(claves.contenidoSemana(materiaId, semana), null);
                navigate(volver);
              }}
            >
              <p>
                Se borrarán el tema, la introducción, los recursos y el link de la clase grabada de la semana {semana}. El
                cambio aplica a todos los grupos de esta materia.
              </p>
            </AccionEliminar>
          )}
        </div>

        {(grupo.isPending || (Boolean(materiaId) && contenido.isPending)) && <Cargando />}
        {grupo.error && <MensajeError error={grupo.error} alReintentar={() => void grupo.refetch()} />}
        {contenido.error && <MensajeError error={contenido.error} alReintentar={() => void contenido.refetch()} />}
        {contenido.data !== undefined && (
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
