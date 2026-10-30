import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { DIAS_EXTRA_MAX, TIPOS_EXAMEN } from '../../../domain/entities/Examen';
import { usaSemana } from '../../../domain/rules/examen';
import { ETIQUETAS_TIPO_EXAMEN } from '../../constants/textos';
import { Campo } from '../common/Campo';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';
import { PreguntaEditor } from './PreguntaEditor';
import { AYUDA_VENTANA, esquemaExamen, preguntaVacia, type FormularioExamenValores } from './esquemaExamen';

interface FormularioExamenProps {
  valoresIniciales: FormularioExamenValores;
  totalSemanas: number;
  esNuevo: boolean;
  tieneIntentos: boolean;
  error: unknown;
  guardando: boolean;
  alGuardar: (valores: FormularioExamenValores) => void;
  alCancelar: () => void;
}

export const FormularioExamen = ({
  valoresIniciales,
  totalSemanas,
  esNuevo,
  tieneIntentos,
  error,
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
  const tipo = useWatch({ control, name: 'tipo' });
  const semanas = Array.from({ length: Math.max(totalSemanas, valoresIniciales.semana) }, (_, i) => i + 1);

  return (
    <FormProvider {...metodos}>
      <form onSubmit={handleSubmit(alGuardar)} noValidate className="space-y-8">
        <section className={`${estilos.tarjeta} space-y-5`}>
          {esNuevo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo etiqueta="Tipo de examen" htmlFor="tipo">
                <select id="tipo" className={estilos.input} {...register('tipo')}>
                  {TIPOS_EXAMEN.map((t) => (
                    <option key={t} value={t}>
                      {ETIQUETAS_TIPO_EXAMEN[t]}
                    </option>
                  ))}
                </select>
              </Campo>
              {usaSemana(tipo) && (
                <Campo etiqueta="Semana" htmlFor="semana" error={errors.semana?.message}>
                  <select id="semana" className={estilos.input} {...register('semana', { valueAsNumber: true })}>
                    {semanas.map((n) => (
                      <option key={n} value={n}>
                        Semana {n}
                      </option>
                    ))}
                  </select>
                </Campo>
              )}
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">
              <span className="font-bold text-on-surface">
                {ETIQUETAS_TIPO_EXAMEN[tipo]}
                {usaSemana(tipo) ? ` · Semana ${valoresIniciales.semana}` : ''}
              </span>{' '}
              · El tipo y la semana no se pueden cambiar después de crear el examen.
            </p>
          )}
          <Campo etiqueta="Título" htmlFor="titulo" error={errors.titulo?.message}>
            <input id="titulo" className={estilos.input} {...register('titulo')} />
          </Campo>
          <Campo etiqueta="Descripción (opcional)" htmlFor="descripcion">
            <textarea id="descripcion" rows={3} className={estilos.input} {...register('descripcion')} />
          </Campo>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Campo etiqueta="Días extra" htmlFor="diasExtra" error={errors.diasExtra?.message} ayuda={AYUDA_VENTANA[tipo]}>
              <input
                id="diasExtra"
                type="number"
                min={0}
                max={DIAS_EXTRA_MAX}
                className={estilos.input}
                {...register('diasExtra', { valueAsNumber: true })}
              />
            </Campo>
            <Campo etiqueta="Puntaje máximo" htmlFor="puntajeMaximo" error={errors.puntajeMaximo?.message}>
              <input
                id="puntajeMaximo"
                type="number"
                min={1}
                step="any"
                className={estilos.input}
                {...register('puntajeMaximo', { valueAsNumber: true })}
              />
            </Campo>
          </div>
        </section>

        <section className={`${estilos.tarjeta} space-y-5`} aria-labelledby="titulo-preguntas">
          <div className="flex items-center justify-between">
            <h2 id="titulo-preguntas" className="text-title-md font-headline-lg text-on-surface">
              Preguntas
            </h2>
            <button type="button" className={estilos.botonSecundario} onClick={() => preguntas.append(preguntaVacia())}>
              <span className="material-symbols-outlined text-[20px]">add</span>
              Añadir pregunta
            </button>
          </div>
          {tieneIntentos && (
            <p className="bg-secondary-container/30 border-l-4 border-primary p-3 rounded-r-lg text-body-sm">
              Este examen ya tiene respuestas de alumnos: si cambias las preguntas, el servidor rechazará el cambio.
              Puedes seguir editando título, descripción, días extra y puntaje.
            </p>
          )}
          {errors.preguntas?.root?.message && <p className="text-[12px] text-error">{errors.preguntas.root.message}</p>}
          {errors.preguntas?.message && <p className="text-[12px] text-error">{errors.preguntas.message}</p>}
          {preguntas.fields.map((campo, i) => (
            <PreguntaEditor
              key={campo.id}
              indice={i}
              puedeQuitarse={preguntas.fields.length > 1}
              alQuitar={() => preguntas.remove(i)}
            />
          ))}
        </section>

        {error !== null && error !== undefined && <MensajeError error={error} />}

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
