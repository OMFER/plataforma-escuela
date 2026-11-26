import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { claves, usePlanes } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { rutas } from '../../routes/rutas';
import { formatearFecha } from '../../utils/fechas';
import { Campo } from '../common/Campo';
import { Cargando } from '../common/Cargando';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';
import { EtiquetaEstadoPlan } from '../planes/EtiquetaEstadoPlan';

const esquema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  descripcion: z.string(),
});

type Valores = z.infer<typeof esquema>;

const VACIO: Valores = { nombre: '', descripcion: '' };

const FormularioPlan = () => {
  const { crearPlan } = useCasosDeUso();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Valores>({ resolver: zodResolver(esquema), defaultValues: VACIO });

  const alta = useMutation({
    mutationFn: (valores: Valores) => crearPlan.ejecutar(valores),
    onSuccess: () => {
      reset(VACIO);
      void queryClient.invalidateQueries({ queryKey: claves.planes });
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => alta.mutate(v))} noValidate className={`${estilos.tarjeta} space-y-4`}>
      <h3 className="text-title-md font-headline-lg text-on-surface">Nuevo plan de estudios</h3>
      <Campo etiqueta="Nombre" htmlFor="plan-nombre" error={errors.nombre?.message}>
        <input id="plan-nombre" placeholder="Prepa intensiva" className={estilos.input} {...register('nombre')} />
      </Campo>
      <Campo etiqueta="Descripción (opcional)" htmlFor="plan-descripcion">
        <textarea id="plan-descripcion" rows={2} className={estilos.input} {...register('descripcion')} />
      </Campo>
      {alta.error && <MensajeError error={alta.error} />}
      {alta.isSuccess && (
        <p role="status" className="text-body-sm text-primary font-bold">
          Plan «{alta.data.nombre}» creado. <Link to={rutas.plan(alta.data.id)} className="underline">Ábrelo para agregar sus materias.</Link>
        </p>
      )}
      <button type="submit" className={`${estilos.botonPrimario} w-full`} disabled={alta.isPending}>
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        {alta.isPending ? 'Creando…' : 'Crear plan'}
      </button>
    </form>
  );
};

/** Planes y sus versiones: cada uno se abre para armarlo, publicarlo o crear una versión nueva. */
export const PanelPlanes = () => {
  const { data: planes, isPending, error, refetch } = usePlanes();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <section className="lg:col-span-2 space-y-4" aria-labelledby="titulo-planes">
        <div className="space-y-1">
          <h2 id="titulo-planes" className="text-title-md font-headline-lg text-on-surface">
            Planes de estudio
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Un plan reúne las materias con su contenido y sus exámenes, y es igual para todos los grupos que lo cursan. Se arma
            en borrador y se publica cuando está completo; después solo admite correcciones.
          </p>
        </div>
        {isPending && <Cargando />}
        {error && <MensajeError error={error} alReintentar={() => void refetch()} />}
        {planes?.length === 0 && <p className="text-body-sm text-on-surface-variant">Aún no hay planes.</p>}
        <ul className="space-y-3">
          {planes?.map((p) => (
            <li key={p.id}>
              <Link
                to={rutas.plan(p.id)}
                className="flex items-center justify-between gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary transition-colors"
              >
                <span className="space-y-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-body-lg font-bold text-on-surface">{p.nombre}</span>
                    <span className="text-body-sm text-on-surface-variant">versión {p.version}</span>
                    <EtiquetaEstadoPlan estado={p.estado} />
                  </span>
                  {p.publicadoEn && (
                    <span className="block text-[12px] text-on-surface-variant">Publicado el {formatearFecha(p.publicadoEn)}</span>
                  )}
                </span>
                <span className="material-symbols-outlined text-primary" aria-hidden="true">
                  chevron_right
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <FormularioPlan />
    </div>
  );
};
