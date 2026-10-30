import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { TOTAL_SEMANAS_POR_DEFECTO } from '../../../domain/entities/Materia';
import { claves, useUsuarios } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { Campo } from '../common/Campo';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';

const esquema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  descripcion: z.string(),
  grupo: z.string(),
  aula: z.string(),
  maestroId: z.string().min(1, 'Elige un maestro.'),
  fechaInicio: z.iso.date({ error: 'Elige la fecha de inicio.' }),
  totalSemanas: z
    .number({ error: 'Escribe un número.' })
    .int('Debe ser un número entero.')
    .min(1, 'Mínimo 1 semana.')
    .max(52, 'Máximo 52 semanas.'),
});

type Valores = z.infer<typeof esquema>;

const VACIO: Valores = {
  nombre: '',
  descripcion: '',
  grupo: '',
  aula: '',
  maestroId: '',
  fechaInicio: '',
  totalSemanas: TOTAL_SEMANAS_POR_DEFECTO,
};

export const FormularioMateria = () => {
  const { crearMateria } = useCasosDeUso();
  const queryClient = useQueryClient();
  const maestros = useUsuarios('maestro');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Valores>({ resolver: zodResolver(esquema), defaultValues: VACIO });

  const alta = useMutation({
    mutationFn: (valores: Valores) => crearMateria.ejecutar(valores),
    onSuccess: () => {
      reset(VACIO);
      void queryClient.invalidateQueries({ queryKey: claves.materias });
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => alta.mutate(v))} noValidate className={`${estilos.tarjeta} space-y-4`}>
      <h3 className="text-title-md font-headline-lg text-on-surface">Nueva materia</h3>
      <Campo etiqueta="Nombre" htmlFor="materia-nombre" error={errors.nombre?.message}>
        <input id="materia-nombre" className={estilos.input} {...register('nombre')} />
      </Campo>
      <Campo etiqueta="Descripción (opcional)" htmlFor="materia-descripcion">
        <textarea id="materia-descripcion" rows={2} className={estilos.input} {...register('descripcion')} />
      </Campo>
      <div className="grid grid-cols-2 gap-4">
        <Campo etiqueta="Grupo" htmlFor="materia-grupo">
          <input id="materia-grupo" className={estilos.input} {...register('grupo')} />
        </Campo>
        <Campo etiqueta="Aula" htmlFor="materia-aula">
          <input id="materia-aula" className={estilos.input} {...register('aula')} />
        </Campo>
      </div>
      <Campo etiqueta="Maestro" htmlFor="materia-maestro" error={errors.maestroId?.message ?? (maestros.error ? 'No se pudo cargar la lista de maestros.' : undefined)}>
        <select id="materia-maestro" className={estilos.input} disabled={maestros.isPending} {...register('maestroId')}>
          <option value="">{maestros.isPending ? 'Cargando maestros…' : 'Selecciona un maestro'}</option>
          {maestros.data?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <div className="grid grid-cols-2 gap-4">
        <Campo etiqueta="Fecha de inicio" htmlFor="materia-inicio" error={errors.fechaInicio?.message}>
          <input id="materia-inicio" type="date" className={estilos.input} {...register('fechaInicio')} />
        </Campo>
        <Campo etiqueta="Total de semanas" htmlFor="materia-semanas" error={errors.totalSemanas?.message}>
          <input
            id="materia-semanas"
            type="number"
            min={1}
            max={52}
            className={estilos.input}
            {...register('totalSemanas', { valueAsNumber: true })}
          />
        </Campo>
      </div>
      {alta.error && <MensajeError error={alta.error} />}
      {alta.isSuccess && (
        <p role="status" className="text-body-sm text-primary font-bold">
          Materia «{alta.data.nombre}» creada.
        </p>
      )}
      <button type="submit" className={`${estilos.botonPrimario} w-full`} disabled={alta.isPending}>
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        {alta.isPending ? 'Creando…' : 'Crear materia'}
      </button>
    </form>
  );
};
