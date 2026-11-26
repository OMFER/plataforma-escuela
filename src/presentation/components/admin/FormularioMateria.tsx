import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Materia } from '../../../domain/entities/Materia';
import { MAX_BLOQUES } from '../../../domain/entities/Plan';
import { describirBloque } from '../../../domain/rules/semanas';
import { claves, useUsuarios } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { Campo } from '../common/Campo';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';

const esquema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  descripcion: z.string(),
  bloque: z.number({ error: 'Elige el bloque.' }).int().min(1).max(MAX_BLOQUES),
  maestroId: z.string(),
});

type Valores = z.infer<typeof esquema>;

const BLOQUES = Array.from({ length: MAX_BLOQUES }, (_, i) => i + 1);

interface FormularioMateriaProps {
  planId: string;
  /** Si se indica, el formulario corrige esa materia en lugar de crear una nueva. */
  materia?: Materia;
  /** En un plan publicado la materia ya no cambia de bloque. */
  bloqueFijo?: boolean;
  alTerminar?: () => void;
}

export const FormularioMateria = ({ planId, materia, bloqueFijo = false, alTerminar }: FormularioMateriaProps) => {
  const { crearMateria, actualizarMateria } = useCasosDeUso();
  const queryClient = useQueryClient();
  const maestros = useUsuarios('maestro');
  const prefijo = materia ? `materia-${materia.id}` : 'materia';
  const vacio: Valores = { nombre: '', descripcion: '', bloque: 1, maestroId: '' };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: materia
      ? { nombre: materia.nombre, descripcion: materia.descripcion ?? '', bloque: materia.bloque, maestroId: materia.maestroId ?? '' }
      : vacio,
  });

  const guardado = useMutation({
    mutationFn: ({ maestroId, bloque, ...valores }: Valores) =>
      materia
        ? actualizarMateria.ejecutar(materia.id, {
            ...valores,
            ...(bloqueFijo ? {} : { bloque }),
            maestroId: maestroId || null,
          })
        : crearMateria.ejecutar({ planId, ...valores, bloque, ...(maestroId ? { maestroId } : {}) }),
    onSuccess: () => {
      if (!materia) reset(vacio);
      void queryClient.invalidateQueries({ queryKey: claves.datosPlan(planId) });
      void queryClient.invalidateQueries({ queryKey: claves.materias });
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
      {!materia && <h3 className="text-title-md font-headline-lg text-on-surface">Agregar materia</h3>}
      <Campo etiqueta="Nombre" htmlFor={`${prefijo}-nombre`} error={errors.nombre?.message}>
        <input id={`${prefijo}-nombre`} className={estilos.input} {...register('nombre')} />
      </Campo>
      <Campo etiqueta="Descripción (opcional)" htmlFor={`${prefijo}-descripcion`}>
        <textarea id={`${prefijo}-descripcion`} rows={2} className={estilos.input} {...register('descripcion')} />
      </Campo>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo
          etiqueta="Bloque"
          htmlFor={`${prefijo}-bloque`}
          error={errors.bloque?.message}
          ayuda={bloqueFijo ? 'El plan ya está publicado: la materia no cambia de bloque.' : 'Las materias del mismo bloque se cursan al mismo tiempo.'}
        >
          <select
            id={`${prefijo}-bloque`}
            className={estilos.input}
            disabled={bloqueFijo}
            {...register('bloque', { valueAsNumber: true })}
          >
            {BLOQUES.map((b) => (
              <option key={b} value={b}>
                Bloque {b} · {describirBloque(b)}
              </option>
            ))}
          </select>
        </Campo>
        <Campo
          etiqueta="Maestro"
          htmlFor={`${prefijo}-maestro`}
          error={maestros.error ? 'No se pudo cargar la lista de maestros.' : undefined}
          ayuda="La cuenta de la escuela que corrige su contenido y exámenes."
        >
          <select id={`${prefijo}-maestro`} className={estilos.input} disabled={maestros.isPending} {...register('maestroId')}>
            <option value="">{maestros.isPending ? 'Cargando maestros…' : 'Sin asignar'}</option>
            {maestros.data?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre} ({m.correo})
              </option>
            ))}
          </select>
        </Campo>
      </div>
      {guardado.error && <MensajeError error={guardado.error} />}
      {!materia && guardado.isSuccess && (
        <p role="status" className="text-body-sm text-primary font-bold">
          Materia «{guardado.data.nombre}» agregada.
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
          {guardado.isPending ? 'Guardando…' : materia ? 'Guardar cambios' : 'Agregar materia'}
        </button>
      </div>
    </form>
  );
};
