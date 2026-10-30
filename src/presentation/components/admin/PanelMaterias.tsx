import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { claves, useMaterias } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { AccionEliminar } from '../common/AccionEliminar';
import { Cargando } from '../common/Cargando';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';
import { FormularioMateria } from './FormularioMateria';

export const PanelMaterias = () => {
  const { eliminarMateria } = useCasosDeUso();
  const queryClient = useQueryClient();
  const { data: materias, isPending, error, refetch } = useMaterias();
  const [editando, setEditando] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <section className="lg:col-span-2 space-y-4" aria-labelledby="titulo-materias">
        <div className="space-y-1">
          <h2 id="titulo-materias" className="text-title-md font-headline-lg text-on-surface">
            Materias
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Una materia guarda el contenido de cada semana y sus exámenes, y se reutiliza cada semestre en sus grupos.
          </p>
        </div>
        {isPending && <Cargando />}
        {error && <MensajeError error={error} alReintentar={() => void refetch()} />}
        {materias?.length === 0 && <p className="text-body-sm text-on-surface-variant">Aún no hay materias.</p>}
        {materias?.map((m) => (
          <article key={m.id} aria-label={m.nombre} className={`${estilos.tarjeta} space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-title-md font-headline-lg text-on-surface">{m.nombre}</h3>
                {m.descripcion && <p className="text-body-sm text-on-surface-variant">{m.descripcion}</p>}
                <p className="text-[12px] text-outline mt-1">{m.totalSemanas} semanas</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={estilos.botonSecundario}
                  aria-expanded={editando === m.id}
                  onClick={() => setEditando(editando === m.id ? null : m.id)}
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                  Editar
                </button>
                <AccionEliminar
                  etiqueta="Eliminar"
                  titulo={`¿Eliminar la materia «${m.nombre}»?`}
                  alEliminar={() => eliminarMateria.ejecutar(m.id)}
                  alEliminado={() => void queryClient.invalidateQueries({ queryKey: claves.materias })}
                >
                  <p>Se borrará la materia junto con el contenido de todas sus semanas y sus exámenes.</p>
                  <p>Si la materia tiene grupos, primero hay que eliminarlos en la pestaña Grupos.</p>
                </AccionEliminar>
              </div>
            </div>
            {editando === m.id && <FormularioMateria materia={m} alTerminar={() => setEditando(null)} />}
          </article>
        ))}
      </section>
      <FormularioMateria />
    </div>
  );
};
