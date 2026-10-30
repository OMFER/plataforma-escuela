import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MAX_SEMANAS, MIN_SEMANAS, TOTAL_SEMANAS_POR_DEFECTO, type Materia } from '../../../domain/entities/Materia';
import { claves } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { Campo } from '../common/Campo';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';

const esquema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  descripcion: z.string(),
  totalSemanas: z
    .number({ error: 'Escribe un número.' })
    .int('Debe ser un número entero.')
    .min(MIN_SEMANAS, `Mínimo ${MIN_SEMANAS} semana.`)
    .max(MAX_SEMANAS, `Máximo ${MAX_SEMANAS} semanas.`),
});

type Valores = z.infer<typeof esquema>;

const VACIO: Valores = { nombre: '', descripcion: '', totalSemanas: TOTAL_SEMANAS_POR_DEFECTO };

interface FormularioMateriaProps {
  /** Si se indica, el formulario edita esa materia en lugar de crear una nueva. */
  materia?: Materia;
  alTerminar?: () => void;
}

export const FormularioMateria = ({ materia, alTerminar }: FormularioMateriaProps) => {
  const { crearMateria, actualizarMateria } = useCasosDeUso();
  const queryClient = useQueryClient();
  const prefijo = materia ? `materia-${materia.id}` : 'materia';
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: materia
      ? { nombre: materia.nombre, descripcion: materia.descripcion ?? '', totalSemanas: materia.totalSemanas }
      : VACIO,
  });

  const guardado = useMutation({
    mutationFn: (valores: Valores) => (materia ? actualizarMateria.ejecutar(materia.id, valores) : crearMateria.ejecutar(valores)),
    onSuccess: () => {
      if (!materia) reset(VACIO);
      void queryClient.invalidateQueries({ queryKey: claves.materias });
      // Los grupos incluyen los datos de su materia.
      void queryClient.invalidateQueries({ queryKey: claves.grupos });
      alTerminar?.();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => guardado.mutate(v))}
      noValidate
      className={materia ? 'space-y-4 pt-4 border-t border-outline-variant' : `${estilos.tarjeta} space-y-4`}
    >
      {!materia && <h3 className="text-title-md font-headline-lg text-on-surface">Nueva materia</h3>}
      <Campo etiqueta="Nombre" htmlFor={`${prefijo}-nombre`} error={errors.nombre?.message}>
        <input id={`${prefijo}-nombre`} className={estilos.input} {...register('nombre')} />
      </Campo>
      <Campo etiqueta="Descripción (opcional)" htmlFor={`${prefijo}-descripcion`}>
        <textarea id={`${prefijo}-descripcion`} rows={2} className={estilos.input} {...register('descripcion')} />
      </Campo>
      <Campo
        etiqueta="Total de semanas"
        htmlFor={`${prefijo}-semanas`}
        error={errors.totalSemanas?.message}
        ayuda="Cuántas semanas dura la materia en cada semestre."
      >
        <input
          id={`${prefijo}-semanas`}
          type="number"
          min={MIN_SEMANAS}
          max={MAX_SEMANAS}
          className={estilos.input}
          {...register('totalSemanas', { valueAsNumber: true })}
        />
      </Campo>
      {guardado.error && <MensajeError error={guardado.error} />}
      {!materia && guardado.isSuccess && (
        <p role="status" className="text-body-sm text-primary font-bold">
          Materia «{guardado.data.nombre}» creada.
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        {materia && alTerminar && (
          <button type="button" className={estilos.botonSecundario} onClick={alTerminar} disabled={guardado.isPending}>
            Cancelar
          </button>
        )}
        <button type="submit" className={`${estilos.botonPrimario} ${materia ? '' : 'w-full'}`} disabled={guardado.isPending}>
          <span className="material-symbols-outlined text-[20px]">{materia ? 'save' : 'add_circle'}</span>
          {guardado.isPending ? 'Guardando…' : materia ? 'Guardar cambios' : 'Crear materia'}
        </button>
      </div>
    </form>
  );
};
