import { Link } from 'react-router-dom';
import { EXAMENES_POR_SEMANA, SEMANAS_POR_MATERIA } from '../../domain/entities/Plan';
import { nombreDeExamen } from '../../domain/rules/examen';
import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { estilos } from '../components/common/estilos';
import { AvisoPlanPublicado, EncabezadoMateria } from '../components/materia/EncabezadoMateria';
import { ImportarExamenes } from '../components/materia/ImportarExamenes';
import { useContenidoMateria, useExamenesMateria } from '../hooks/consultas';
import { useMateriaDeRuta } from '../hooks/useParametrosGrupo';
import { rutas } from '../routes/rutas';

const numeros = (cuantos: number) => Array.from({ length: cuantos }, (_, i) => i + 1);

/** Lo que corrige el maestro de una materia: el contenido y los dos exámenes de cada una de sus dos semanas. */
export const MateriaPage = () => {
  const { materiaId, materia } = useMateriaDeRuta();
  const contenido = useContenidoMateria(materiaId);
  const examenes = useExamenesMateria(materiaId);
  const enBorrador = materia.data?.plan.estado === 'borrador';

  return (
    <main className="min-h-screen">
      <div className="max-w-[1000px] mx-auto p-gutter py-8 space-y-8">
        {materia.isPending && <Cargando />}
        {materia.error && <MensajeError error={materia.error} alReintentar={() => void materia.refetch()} />}
        {materia.data === null && <EstadoVacio icono="search_off" titulo="No encontramos esta materia." />}

        {materia.data && (
          <>
            <header className="space-y-3">
              <EncabezadoMateria materia={materia.data} />
              <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">{materia.data.nombre}</h1>
              {materia.data.descripcion && <p className="text-body-lg text-on-surface-variant">{materia.data.descripcion}</p>}
              {!enBorrador && <AvisoPlanPublicado />}
            </header>

            {(contenido.error || examenes.error) && (
              <MensajeError
                error={contenido.error ?? examenes.error}
                alReintentar={() => {
                  void contenido.refetch();
                  void examenes.refetch();
                }}
              />
            )}
            {(contenido.isPending || examenes.isPending) && <Cargando />}

            {contenido.data &&
              examenes.data &&
              numeros(SEMANAS_POR_MATERIA).map((semana) => {
                const deLaSemana = contenido.data.find((c) => c.semana === semana);
                return (
                  <section key={semana} aria-label={`Semana ${semana}`} className={`${estilos.tarjeta} space-y-5`}>
                    <h2 className="text-title-md font-headline-lg text-on-surface">Semana {semana}</h2>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className={estilos.etiqueta}>Contenido</p>
                        <p className="text-body-lg text-on-surface">{deLaSemana ? deLaSemana.tema : 'Sin contenido todavía'}</p>
                        {deLaSemana && (
                          <p className="text-body-sm text-on-surface-variant">
                            {deLaSemana.recursos.length} recursos
                            {deLaSemana.links?.grabacion ? ' · con clase grabada' : ' · sin clase grabada'}
                          </p>
                        )}
                      </div>
                      {deLaSemana || enBorrador ? (
                        <Link to={rutas.editarContenido(materiaId, semana)} className={`${estilos.botonSecundario} shrink-0`}>
                          <span className="material-symbols-outlined text-[20px]">{deLaSemana ? 'edit' : 'add'}</span>
                          {deLaSemana ? 'Editar contenido' : 'Crear contenido'}
                        </Link>
                      ) : null}
                    </div>

                    <ul className="divide-y divide-outline-variant border-t border-outline-variant">
                      {numeros(EXAMENES_POR_SEMANA).map((numero) => {
                        const examen = examenes.data.find((e) => e.semana === semana && e.numero === numero);
                        return (
                          <li key={numero} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                            <div>
                              <p className={estilos.etiqueta}>
                                Examen {numero} · abre el {numero === 1 ? 'lunes' : 'jueves'}
                              </p>
                              <p className="text-body-lg text-on-surface">
                                {examen ? examen.titulo : 'Sin examen todavía'}
                              </p>
                              {examen && (
                                <p className="text-body-sm text-on-surface-variant">{examen.preguntas.length} preguntas</p>
                              )}
                            </div>
                            {examen ? (
                              <Link to={rutas.editarExamen(materiaId, examen.id)} className={`${estilos.botonSecundario} shrink-0`}>
                                <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                Editar examen {numero}
                              </Link>
                            ) : enBorrador ? (
                              <Link
                                to={rutas.nuevoExamen(materiaId, semana, numero)}
                                className={`${estilos.botonSecundario} shrink-0`}
                                aria-label={`Crear ${nombreDeExamen(semana, numero)}`}
                              >
                                <span className="material-symbols-outlined text-[20px]">post_add</span>
                                Crear examen {numero}
                              </Link>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}

            {enBorrador && <ImportarExamenes materiaId={materiaId} />}
          </>
        )}
      </div>
    </main>
  );
};
