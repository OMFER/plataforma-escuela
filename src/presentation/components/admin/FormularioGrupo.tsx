import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { claves, useMaterias, useUsuarios } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { Campo } from '../common/Campo';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';

const esquema = z.object({
  materiaId: z.string().min(1, 'Elige una materia.'),
  maestroId: z.string().min(1, 'Elige un maestro.'),
  nombre: z.string().trim().min(1, 'Escribe el nombre del grupo.'),
  periodo: z.string().trim().min(1, 'Escribe el periodo, por ejemplo 2026-B.'),
  aula: z.string(),
  fechaInicio: z.iso.date({ error: 'Elige la fecha de inicio.' }),
});

type Valores = z.infer<typeof esquema>;

const VACIO: Valores = { materiaId: '', maestroId: '', nombre: '', periodo: '', aula: '', fechaInicio: '' };

export const FormularioGrupo = () => {
  const { crearGrupo } = useCasosDeUso();
  const queryClient = useQueryClient();
  const materias = useMaterias();
  const maestros = useUsuarios('maestro');
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
        etiqueta="Materia"
        htmlFor="grupo-materia"
        error={errors.materiaId?.message ?? (materias.error ? 'No se pudo cargar la lista de materias.' : undefined)}
      >
        <select id="grupo-materia" className={estilos.input} disabled={materias.isPending} {...register('materiaId')}>
          <option value="">{materias.isPending ? 'Cargando materias…' : 'Selecciona una materia'}</option>
          {materias.data?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <Campo
        etiqueta="Maestro"
        htmlFor="grupo-maestro"
        error={errors.maestroId?.message ?? (maestros.error ? 'No se pudo cargar la lista de maestros.' : undefined)}
      >
        <select id="grupo-maestro" className={estilos.input} disabled={maestros.isPending} {...register('maestroId')}>
          <option value="">{maestros.isPending ? 'Cargando maestros…' : 'Selecciona un maestro'}</option>
          {maestros.data?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <div className="grid grid-cols-2 gap-4">
        <Campo etiqueta="Grupo" htmlFor="grupo-nombre" error={errors.nombre?.message}>
          <input id="grupo-nombre" placeholder="05" className={estilos.input} {...register('nombre')} />
        </Campo>
        <Campo etiqueta="Periodo" htmlFor="grupo-periodo" error={errors.periodo?.message}>
          <input id="grupo-periodo" placeholder="2026-B" className={estilos.input} {...register('periodo')} />
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Campo etiqueta="Aula (opcional)" htmlFor="grupo-aula">
          <input id="grupo-aula" className={estilos.input} {...register('aula')} />
        </Campo>
        <Campo etiqueta="Fecha de inicio" htmlFor="grupo-inicio" error={errors.fechaInicio?.message}>
          <input id="grupo-inicio" type="date" className={estilos.input} {...register('fechaInicio')} />
        </Campo>
      </div>
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
