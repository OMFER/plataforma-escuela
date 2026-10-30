import { useState } from 'react';
import { useMaterias } from '../../hooks/consultas';
import { formatearFecha } from '../../utils/fechas';
import { Cargando } from '../common/Cargando';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';
import { FormularioMateria } from './FormularioMateria';
import { GestionAlumnos } from './GestionAlumnos';

export const PanelMaterias = () => {
  const { data: materias, isPending, error, refetch } = useMaterias();
  const [abierta, setAbierta] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <section className="lg:col-span-2 space-y-4" aria-labelledby="titulo-materias">
        <h2 id="titulo-materias" className="text-title-md font-headline-lg text-on-surface">
          Materias
        </h2>
        {isPending && <Cargando />}
        {error && <MensajeError error={error} alReintentar={() => void refetch()} />}
        {materias?.length === 0 && <p className="text-body-sm text-on-surface-variant">Aún no hay materias.</p>}
        {materias?.map((m) => {
          const expandida = abierta === m.id;
          return (
            <article key={m.id} className={`${estilos.tarjeta} space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h3 className="text-title-md font-headline-lg text-on-surface">{m.nombre}</h3>
                  <p className="text-body-sm text-outline">
                    {[m.grupo && `Grupo ${m.grupo}`, m.aula && `Aula ${m.aula}`, m.maestro.nombre && `Maestro: ${m.maestro.nombre}`]
                      .filter(Boolean)
                      .join(' | ')}
                  </p>
                  <p className="text-[12px] text-on-surface-variant mt-1">
                    Inicia {formatearFecha(m.fechaInicio)} · {m.totalSemanas} semanas
                  </p>
                </div>
                <button
                  type="button"
                  className={estilos.botonSecundario}
                  aria-expanded={expandida}
                  onClick={() => setAbierta(expandida ? null : m.id)}
                >
                  <span className="material-symbols-outlined text-[20px]">group</span>
                  {expandida ? 'Ocultar alumnos' : 'Alumnos'}
                </button>
              </div>
              {expandida && <GestionAlumnos materiaId={m.id} />}
            </article>
          );
        })}
      </section>
      <FormularioMateria />
    </div>
  );
};
