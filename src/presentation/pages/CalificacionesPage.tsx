import { Link } from 'react-router-dom';
import { TablaCalificacionesAlumno } from '../components/calificaciones/TablaCalificacionesAlumno';
import { TablaCalificacionesGrupo } from '../components/calificaciones/TablaCalificacionesGrupo';
import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { estilos } from '../components/common/estilos';
import { useCalificaciones } from '../hooks/consultas';
import { useGrupoDeRuta } from '../hooks/useParametrosGrupo';
import { useUsuarioActual } from '../providers/SesionContext';
import { rutas } from '../routes/rutas';

export const CalificacionesPage = () => {
  const usuario = useUsuarioActual();
  const { grupoId, grupo } = useGrupoDeRuta();
  const calificaciones = useCalificaciones(grupoId);
  const esAlumno = usuario.rol === 'alumno';
  const propias = calificaciones.data?.[0];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1100px] mx-auto p-gutter py-8 space-y-8">
        <Link to={rutas.inicio} className={estilos.enlaceVolver}>
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Volver al inicio
        </Link>
        <header className="space-y-1">
          {grupo.data && (
            <p className="text-title-md text-primary">
              {grupo.data.materia.nombre}
              <span className="text-body-sm text-on-surface-variant font-normal">
                {' '}
                · Grupo {grupo.data.nombre} · {grupo.data.periodo}
              </span>
            </p>
          )}
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">
            {esAlumno ? 'Mis calificaciones' : 'Calificaciones del grupo'}
          </h1>
        </header>

        {calificaciones.isPending && <Cargando texto="Cargando calificaciones…" />}
        {calificaciones.error && <MensajeError error={calificaciones.error} alReintentar={() => void calificaciones.refetch()} />}
        {calificaciones.data &&
          (esAlumno ? (
            propias ? (
              <TablaCalificacionesAlumno calificaciones={propias} />
            ) : (
              <EstadoVacio icono="grading" titulo="Aún no tienes calificaciones en este grupo." />
            )
          ) : (
            <TablaCalificacionesGrupo calificaciones={calificaciones.data} />
          ))}
      </div>
    </main>
  );
};
