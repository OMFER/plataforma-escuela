import { useMatch, useParams, useSearchParams } from 'react-router-dom';
import { materiasDeSemana, semanaDeMateria } from '../../domain/rules/semanas';
import { useGrupo, useMateria } from './consultas';

/** Para piezas fuera de las rutas (como el header): si la pantalla actual pertenece a un grupo, lo carga. */
export const useGrupoEnPantalla = () => {
  const deGrupo = useMatch('/grupos/:grupoId/*');
  const grupoId = deGrupo?.params.grupoId ?? '';
  const grupo = useGrupo(grupoId);
  return grupoId ? grupo.data : undefined;
};

/** Lee `:grupoId` de la URL y carga el grupo (con su plan y materias). */
export const useGrupoDeRuta = () => {
  const { grupoId = '' } = useParams<{ grupoId: string }>();
  const grupo = useGrupo(grupoId);
  return { grupoId, grupo };
};

/**
 * Lee `:grupoId`, `:semana` (del grupo) y `?materia=` de la URL. Si la materia no viene o no se
 * cursa esa semana, se elige la primera del bloque.
 */
export const useParametrosSemana = () => {
  const params = useParams<{ semana: string }>();
  const [busqueda] = useSearchParams();
  const { grupoId, grupo } = useGrupoDeRuta();
  const semana = Number(params.semana);
  const materias = grupo.data ? materiasDeSemana(grupo.data, semana) : [];
  const pedida = busqueda.get('materia');
  const materia = materias.find((m) => m.id === pedida) ?? materias[0];
  return { grupoId, semana, grupo, materias, materia, semanaDeMateria: semanaDeMateria(semana) };
};

/** Lee `:materiaId` de la URL y carga la materia (con su versión del plan). */
export const useMateriaDeRuta = () => {
  const { materiaId = '' } = useParams<{ materiaId: string }>();
  const materia = useMateria(materiaId);
  return { materiaId, materia };
};
