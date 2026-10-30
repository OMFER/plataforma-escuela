import { Link } from 'react-router-dom';
import type { Grupo } from '../../../domain/entities/Grupo';
import { useExamenesGrupo } from '../../hooks/consultas';
import { useUsuarioActual } from '../../providers/SesionContext';
import { rutas } from '../../routes/rutas';
import { describirVentana } from '../../utils/ventana';
import { estilos } from '../common/estilos';
import { BotonExamen } from '../examen/BotonExamen';

/** Acceso al examen final del grupo: el alumno lo responde; el maestro lo crea o edita. */
export const AccesoExamenFinal = ({ grupo }: { grupo: Grupo }) => {
  const usuario = useUsuarioActual();
  const examenes = useExamenesGrupo(grupo.id);
  const final = examenes.data?.find((e) => e.tipo === 'Final') ?? null;

  if (examenes.error) {
    return <p className="text-body-sm text-error">No se pudo cargar el examen final.</p>;
  }

  if (usuario.rol !== 'maestro') {
    return (
      <BotonExamen
        grupoId={grupo.id}
        examen={final}
        cargando={examenes.isPending}
        nombre="Examen final"
        accion="Hacer examen final"
        textoSinExamen="Sin examen final"
        icono="workspace_premium"
      />
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Link
        to={final ? rutas.editarExamen(grupo.id, final.id) : rutas.nuevoExamen(grupo.id, 'Final')}
        className={estilos.botonSecundario}
      >
        <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
        {final ? 'Editar examen final' : 'Crear examen final'}
      </Link>
      {final && <p className="text-[12px] text-on-surface-variant">{describirVentana(final.ventana)}</p>}
    </div>
  );
};
