import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { claves, useAlumnosMateria, useUsuarios } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { Cargando } from '../common/Cargando';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';

export const GestionAlumnos = ({ materiaId }: { materiaId: string }) => {
  const { inscribirAlumnos, darDeBajaAlumno } = useCasosDeUso();
  const queryClient = useQueryClient();
  const inscritos = useAlumnosMateria(materiaId);
  const alumnos = useUsuarios('alumno');
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [filtro, setFiltro] = useState('');

  const refrescar = () => queryClient.invalidateQueries({ queryKey: claves.alumnosMateria(materiaId) });

  const inscripcion = useMutation({
    mutationFn: () => inscribirAlumnos.ejecutar(materiaId, seleccion),
    onSuccess: (lista) => {
      queryClient.setQueryData(claves.alumnosMateria(materiaId), lista);
      setSeleccion([]);
    },
  });

  const baja = useMutation({
    mutationFn: (alumnoId: string) => darDeBajaAlumno.ejecutar(materiaId, alumnoId),
    onSuccess: () => void refrescar(),
  });

  const idsInscritos = new Set(inscritos.data?.map((a) => a.id));
  const texto = filtro.trim().toLowerCase();
  const disponibles = (alumnos.data ?? []).filter(
    (a) => !idsInscritos.has(a.id) && (!texto || `${a.nombre} ${a.correo}`.toLowerCase().includes(texto)),
  );

  const alternar = (id: string) =>
    setSeleccion((previa) => (previa.includes(id) ? previa.filter((x) => x !== id) : [...previa, id]));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant">
      <div className="space-y-3">
        <h4 className="text-label-caps font-label-caps text-on-surface-variant uppercase">
          Inscritos {inscritos.data ? `(${inscritos.data.length})` : ''}
        </h4>
        {inscritos.isPending && <Cargando />}
        {inscritos.error && <MensajeError error={inscritos.error} alReintentar={() => void inscritos.refetch()} />}
        {baja.error && <MensajeError error={baja.error} />}
        {inscritos.data?.length === 0 && <p className="text-body-sm text-on-surface-variant">Sin alumnos inscritos.</p>}
        <ul className="divide-y divide-outline-variant">
          {inscritos.data?.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="text-body-sm font-semibold text-on-surface truncate">{a.nombre}</p>
                <p className="text-[12px] text-on-surface-variant truncate">{a.correo}</p>
              </div>
              <button
                type="button"
                className="text-error text-body-sm font-bold hover:underline disabled:opacity-50"
                disabled={baja.isPending}
                onClick={() => baja.mutate(a.id)}
              >
                Dar de baja
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h4 className="text-label-caps font-label-caps text-on-surface-variant uppercase">Inscribir alumnos</h4>
        <input
          type="search"
          className={estilos.input}
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar alumnos"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        {alumnos.isPending && <Cargando />}
        {alumnos.error && <MensajeError error={alumnos.error} />}
        <ul className="max-h-60 overflow-y-auto space-y-1">
          {disponibles.map((a) => (
            <li key={a.id}>
              <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-low cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-primary w-4 h-4"
                  checked={seleccion.includes(a.id)}
                  onChange={() => alternar(a.id)}
                />
                <span className="text-body-sm text-on-surface">
                  {a.nombre} <span className="text-on-surface-variant">· {a.correo}</span>
                </span>
              </label>
            </li>
          ))}
          {alumnos.data && disponibles.length === 0 && (
            <li className="text-body-sm text-on-surface-variant px-3">No hay alumnos disponibles.</li>
          )}
        </ul>
        {inscripcion.error && <MensajeError error={inscripcion.error} />}
        <button
          type="button"
          className={estilos.botonPrimario}
          disabled={seleccion.length === 0 || inscripcion.isPending}
          onClick={() => inscripcion.mutate()}
        >
          <span className="material-symbols-outlined text-[20px]">group_add</span>
          {inscripcion.isPending ? 'Inscribiendo…' : `Inscribir (${seleccion.length})`}
        </button>
      </div>
    </div>
  );
};
