import { useState } from 'react';
import { ROLES, esRol, type Rol } from '../../../domain/entities/Usuario';
import { ETIQUETAS_ROL } from '../../constants/textos';
import { useUsuarios } from '../../hooks/consultas';
import { Cargando } from '../common/Cargando';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';
import { FormularioUsuario } from './FormularioUsuario';

export const PanelUsuarios = () => {
  const [rol, setRol] = useState<Rol | undefined>(undefined);
  const { data: usuarios, isPending, error, refetch } = useUsuarios(rol);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <section className="lg:col-span-2 space-y-4" aria-labelledby="titulo-usuarios">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-usuarios" className="text-title-md font-headline-lg text-on-surface">
            Usuarios
          </h2>
          <label className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            Filtrar por rol
            <select
              className={`${estilos.input} w-auto`}
              value={rol ?? ''}
              onChange={(e) => setRol(esRol(e.target.value) ? e.target.value : undefined)}
            >
              <option value="">Todos</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ETIQUETAS_ROL[r]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {isPending && <Cargando />}
        {error && <MensajeError error={error} alReintentar={() => void refetch()} />}
        {usuarios && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-label-caps font-label-caps text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-6 py-4">Nombre</th>
                  <th scope="col" className="px-6 py-4">Correo</th>
                  <th scope="col" className="px-6 py-4">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-body-sm text-on-surface-variant">
                      No hay usuarios con este filtro.
                    </td>
                  </tr>
                )}
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-bright transition-colors">
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{u.nombre}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{u.correo}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold rounded text-on-surface-variant uppercase">
                        {ETIQUETAS_ROL[u.rol]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <FormularioUsuario />
    </div>
  );
};
