import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { CourseCard } from '../components/dashboard/CourseCard';
import { MisMaterias } from '../components/dashboard/MisMaterias';
import { APP_TEXTS } from '../constants/textos';
import { useMisGrupos } from '../hooks/consultas';
import { useUsuarioActual } from '../providers/SesionContext';

const Grupos = ({ titulo }: { titulo?: string }) => {
  const { data: grupos, isPending, error, refetch } = useMisGrupos();
  return (
    <section className="space-y-6" aria-label={titulo ?? 'Mis grupos'}>
      {titulo && <h2 className="text-title-md font-headline-lg text-on-surface">{titulo}</h2>}
      {isPending && <Cargando texto="Cargando grupos…" />}
      {error && <MensajeError error={error} alReintentar={() => void refetch()} />}
      {grupos?.length === 0 && <EstadoVacio icono="school" titulo={APP_TEXTS.dashboard.sinGrupos} />}
      {grupos?.map((grupo) => <CourseCard key={grupo.id} grupo={grupo} />)}
    </section>
  );
};

export const DashboardPage = () => {
  const usuario = useUsuarioActual();
  const esMaestro = usuario.rol === 'maestro';

  return (
    <main className="min-h-screen">
      <div className="max-w-[1200px] mx-auto p-gutter space-y-section-gap">
        <section className="space-y-2">
          <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-primary">
            {APP_TEXTS.dashboard.greeting}, {usuario.nombre}!
          </h2>
          <p className="text-body-lg text-on-surface-variant">{APP_TEXTS.dashboard.subtitulo[usuario.rol]}</p>
        </section>

        {esMaestro ? (
          <>
            <MisMaterias />
            <Grupos titulo="Grupos que cursan tus materias" />
          </>
        ) : (
          <Grupos />
        )}
      </div>
    </main>
  );
};
