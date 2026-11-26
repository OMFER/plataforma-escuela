import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { DIAS_EXTRA_MAX } from '../../../domain/entities/Examen';
import { EXAMENES_POR_SEMANA, SEMANAS_POR_MATERIA } from '../../../domain/entities/Plan';
import { Campo } from '../common/Campo';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';
import { PreguntaEditor } from './PreguntaEditor';
import { AYUDA_VENTANA, esquemaExamen, preguntaVacia, type FormularioExamenValores } from './esquemaExamen';

interface FormularioExamenProps {
  valoresIniciales: FormularioExamenValores;
  esNuevo: boolean;
  /** Ya hay respuestas de alumnos: solo se corrige la redacción de preguntas y opciones. */
  soloRedaccion: boolean;
  error: unknown;
  /** Confirmación del último guardado; se muestra junto al botón para que se vea al hacer clic. */
  aviso?: string | null;
  guardando: boolean;
  alGuardar: (valores: FormularioExamenValores) => void;
  alCancelar: () => void;
}

const opciones = (cuantas: number) => Array.from({ length: cuantas }, (_, i) => i + 1);

export const FormularioExamen = ({
  valoresIniciales,
  esNuevo,
  soloRedaccion,
  error,
  aviso = null,
  guardando,
  alGuardar,
  alCancelar,
}: FormularioExamenProps) => {
  const metodos = useForm<FormularioExamenValores>({
    resolver: zodResolver(esquemaExamen),
    defaultValues: valoresIniciales,
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = metodos;
  const preguntas = useFieldArray({ control, name: 'preguntas' });
  const numero = useWatch({ control, name: 'numero' });

  return (
    <FormProvider {...metodos}>
      <form onSubmit={handleSubmit(alGuardar)} noValidate className="space-y-8">
        <section className={`${estilos.tarjeta} space-y-5`}>
          {esNuevo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo etiqueta="Semana de la materia" htmlFor="semana" error={errors.semana?.message}>
                <select id="semana" className={estilos.input} {...register('semana', { valueAsNumber: true })}>
                  {opciones(SEMANAS_POR_MATERIA).map((n) => (
                    <option key={n} value={n}>
                      Semana {n}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo etiqueta="Examen" htmlFor="numero" error={errors.numero?.message}>
                <select id="numero" className={estilos.input} {...register('numero', { valueAsNumber: true })}>
                  {opciones(EXAMENES_POR_SEMANA).map((n) => (
                    <option key={n} value={n}>
                      Examen {n}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">
              <span className="font-bold text-on-surface">
                Semana {valoresIniciales.semana} · Examen {valoresIniciales.numero}
              </span>{' '}
              · La semana y el número no se pueden cambiar después de crear el examen.
            </p>
          )}
          <Campo etiqueta="Título" htmlFor="titulo" error={errors.titulo?.message}>
            <input id="titulo" className={estilos.input} {...register('titulo')} />
          </Campo>
          <Campo etiqueta="Descripción (opcional)" htmlFor="descripcion">
            <textarea id="descripcion" rows={3} className={estilos.input} {...register('descripcion')} />
          </Campo>
          <Campo etiqueta="Días extra" htmlFor="diasExtra" error={errors.diasExtra?.message} ayuda={AYUDA_VENTANA[numero]}>
            <input
              id="diasExtra"
              type="number"
              min={0}
              max={DIAS_EXTRA_MAX}
              className={estilos.input}
              {...register('diasExtra', { valueAsNumber: true })}
            />
          </Campo>
        </section>

        <section className={`${estilos.tarjeta} space-y-5`} aria-labelledby="titulo-preguntas">
          <div className="flex items-center justify-between">
            <h2 id="titulo-preguntas" className="text-title-md font-headline-lg text-on-surface">
              Preguntas
            </h2>
            {!soloRedaccion && (
              <button type="button" className={estilos.botonSecundario} onClick={() => preguntas.append(preguntaVacia())}>
                <span className="material-symbols-outlined text-[20px]">add</span>
                Añadir pregunta
              </button>
            )}
          </div>
          {soloRedaccion && (
            <p className="bg-secondary-container/30 border-l-4 border-primary p-3 rounded-r-lg text-body-sm">
              Este examen ya tiene respuestas de alumnos: puedes corregir la redacción de las preguntas y de sus opciones, pero
              no cambiar la respuesta correcta ni agregar o quitar preguntas u opciones, porque alteraría sus calificaciones.
            </p>
          )}
          {errors.preguntas?.root?.message && <p className="text-[12px] text-error">{errors.preguntas.root.message}</p>}
          {errors.preguntas?.message && <p className="text-[12px] text-error">{errors.preguntas.message}</p>}
          {preguntas.fields.map((campo, i) => (
            <PreguntaEditor
              key={campo.id}
              indice={i}
              soloRedaccion={soloRedaccion}
              puedeQuitarse={!soloRedaccion && preguntas.fields.length > 1}
              alQuitar={() => preguntas.remove(i)}
            />
          ))}
        </section>

        {error !== null && error !== undefined && <MensajeError error={error} />}
        {aviso && !guardando && (
          <p role="status" className="flex items-center gap-2 bg-secondary-container/30 border-l-4 border-primary p-3 rounded-r-lg text-body-sm">
            <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">check_circle</span>
            {aviso}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" className={estilos.botonSecundario} onClick={alCancelar} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className={estilos.botonPrimario} disabled={guardando}>
            <span className="material-symbols-outlined text-[20px]">save</span>
            {guardando ? 'Guardando…' : esNuevo ? 'Crear examen' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};
