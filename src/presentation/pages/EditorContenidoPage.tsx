import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Cargando } from '../components/common/Cargando';
import { MensajeError } from '../components/common/MensajeError';
import { EncabezadoSemana } from '../components/contenido/EncabezadoSemana';
import { FormularioContenido } from '../components/contenido/FormularioContenido';
import { aCambiosContenido, type FormularioContenidoValores } from '../components/contenido/esquemaContenido';
import { claves, useContenidoSemana } from '../hooks/consultas';
import { useParametrosSemana } from '../hooks/useParametrosSemana';
import { useCasosDeUso } from '../providers/DependenciasContext';
import { rutas } from '../routes/rutas';

export const EditorContenidoPage = () => {
  const { materiaId, semana, materia } = useParametrosSemana();
  const { guardarContenidoSemana } = useCasosDeUso();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const contenido = useContenidoSemana(materiaId, semana);
  const volver = rutas.semana(materiaId, semana);

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

  return (
    <main className="min-h-screen">
      <div className="max-w-[900px] mx-auto p-gutter py-8 space-y-8">
        <EncabezadoSemana
          materiaId={materiaId}
          semana={semana}
          materia={materia}
          volverA={{ ruta: volver, texto: `Volver a la semana ${semana}` }}
        />
        <h2 className="text-title-md font-headline-lg text-on-surface">
          {contenido.data ? 'Editar contenido de la semana' : 'Crear contenido de la semana'}
        </h2>

        {contenido.isPending && <Cargando />}
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
