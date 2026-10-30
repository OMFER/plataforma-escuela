import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import type { ContenidoSemana } from '../../../domain/entities/Contenido';
import { Campo } from '../common/Campo';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';
import { RecursoEditor } from './RecursoEditor';
import {
  esquemaContenido,
  recursoVacio,
  valoresIniciales,
  type FormularioContenidoValores,
} from './esquemaContenido';

interface FormularioContenidoProps {
  inicial: ContenidoSemana | null;
  error: unknown;
  guardando: boolean;
  alGuardar: (valores: FormularioContenidoValores) => void;
  alCancelar: () => void;
}

export const FormularioContenido = ({ inicial, error, guardando, alGuardar, alCancelar }: FormularioContenidoProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioContenidoValores>({
    resolver: zodResolver(esquemaContenido),
    defaultValues: valoresIniciales(inicial),
  });
  const recursos = useFieldArray({ control, name: 'recursos' });

  return (
    <form onSubmit={handleSubmit(alGuardar)} noValidate className="space-y-8">
      <section className={`${estilos.tarjeta} space-y-5`}>
        <Campo etiqueta="Tema" htmlFor="tema" error={errors.tema?.message}>
          <input id="tema" className={estilos.input} {...register('tema')} />
        </Campo>
        <Campo etiqueta="Introducción" htmlFor="introduccion" ayuda="Texto breve que verán tus alumnos al abrir la semana.">
          <textarea id="introduccion" rows={5} className={estilos.input} {...register('introduccion')} />
        </Campo>
      </section>

      <section className={`${estilos.tarjeta} space-y-5`} aria-labelledby="titulo-recursos">
        <div className="flex items-center justify-between">
          <h2 id="titulo-recursos" className="text-title-md font-headline-lg text-on-surface">
            Recursos
          </h2>
          <button type="button" className={estilos.botonSecundario} onClick={() => recursos.append(recursoVacio())}>
            <span className="material-symbols-outlined text-[20px]">add</span>
            Añadir recurso
          </button>
        </div>
        {recursos.fields.length === 0 && (
          <p className="text-body-sm text-on-surface-variant">Aún no hay recursos. Añade PDFs, páginas web o videos de YouTube.</p>
        )}
        {recursos.fields.map((campo, i) => (
          <RecursoEditor
            key={campo.id}
            indice={i}
            total={recursos.fields.length}
            register={register}
            errores={errors.recursos?.[i]}
            alSubir={() => recursos.move(i, i - 1)}
            alBajar={() => recursos.move(i, i + 1)}
            alQuitar={() => recursos.remove(i)}
          />
        ))}
      </section>

      <section className={`${estilos.tarjeta} space-y-5`}>
        <Campo
          etiqueta="Link de la clase grabada"
          htmlFor="grabacion"
          error={errors.grabacion?.message}
          ayuda="Enlace de Drive, Zoom o Meet. Déjalo vacío si aún no está disponible."
        >
          <input id="grabacion" type="url" placeholder="https://" className={estilos.input} {...register('grabacion')} />
        </Campo>
      </section>

      {error !== null && error !== undefined && <MensajeError error={error} />}

      <div className="flex justify-end gap-3">
        <button type="button" className={estilos.botonSecundario} onClick={alCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className={estilos.botonPrimario} disabled={guardando}>
          <span className="material-symbols-outlined text-[20px]">save</span>
          {guardando ? 'Guardando…' : 'Guardar contenido'}
        </button>
      </div>
    </form>
  );
};
