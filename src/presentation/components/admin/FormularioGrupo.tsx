import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { nombreDePlan } from '../../../domain/entities/Plan';
import { esLunes } from '../../../domain/rules/fechas';
import { claves, usePlanes } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { Campo } from '../common/Campo';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';

const esquema = z.object({
  planId: z.string().min(1, 'Elige un plan publicado.'),
  nombre: z.string().trim().min(1, 'Escribe el nombre del grupo.'),
  fechaInicio: z.iso
    .date({ error: 'Elige la fecha de inicio.' })
    .refine(esLunes, 'La fecha de inicio debe ser un lunes.'),
});

type Valores = z.infer<typeof esquema>;

const VACIO: Valores = { planId: '', nombre: '', fechaInicio: '' };

export const FormularioGrupo = () => {
  const { crearGrupo } = useCasosDeUso();
  const queryClient = useQueryClient();
  const planes = usePlanes();
  const publicados = planes.data?.filter((p) => p.estado === 'publicado') ?? [];
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Valores>({ resolver: zodResolver(esquema), defaultValues: VACIO });

  const alta = useMutation({
    mutationFn: (valores: Valores) => crearGrupo.ejecutar(valores),
    onSuccess: () => {
      reset(VACIO);
      void queryClient.invalidateQueries({ queryKey: claves.grupos });
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => alta.mutate(v))} noValidate className={`${estilos.tarjeta} space-y-4`}>
      <h3 className="text-title-md font-headline-lg text-on-surface">Nuevo grupo</h3>
      <Campo
        etiqueta="Plan de estudios"
        htmlFor="grupo-plan"
        error={errors.planId?.message ?? (planes.error ? 'No se pudo cargar la lista de planes.' : undefined)}
        ayuda="Solo aparecen los planes publicados."
      >
        <select id="grupo-plan" className={estilos.input} disabled={planes.isPending} {...register('planId')}>
          <option value="">{planes.isPending ? 'Cargando planes…' : 'Selecciona un plan'}</option>
          {publicados.map((p) => (
            <option key={p.id} value={p.id}>
              {nombreDePlan(p)}
            </option>
          ))}
        </select>
      </Campo>
      <Campo etiqueta="Nombre del grupo" htmlFor="grupo-nombre" error={errors.nombre?.message}>
        <input id="grupo-nombre" placeholder="Generación enero 2027" className={estilos.input} {...register('nombre')} />
      </Campo>
      <Campo
        etiqueta="Fecha de inicio"
        htmlFor="grupo-inicio"
        error={errors.fechaInicio?.message}
        ayuda="Un lunes: ese día abre la semana 1."
      >
        <input id="grupo-inicio" type="date" className={estilos.input} {...register('fechaInicio')} />
      </Campo>
      {alta.error && <MensajeError error={alta.error} />}
      {alta.isSuccess && (
        <p role="status" className="text-body-sm text-primary font-bold">
          Grupo {alta.data.nombre} creado.
        </p>
      )}
      <button type="submit" className={`${estilos.botonPrimario} w-full`} disabled={alta.isPending}>
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        {alta.isPending ? 'Creando…' : 'Crear grupo'}
      </button>
    </form>
  );
};
