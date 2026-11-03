import { useMatch, useParams } from 'react-router-dom';
import { useGrupo } from './consultas';

/** Para piezas fuera de las rutas (como el header): si la pantalla actual pertenece a un grupo, lo carga. */
export const useGrupoEnPantalla = () => {
  const deGrupo = useMatch('/grupos/:grupoId/*');
  const grupoId = deGrupo?.params.grupoId ?? '';
  const grupo = useGrupo(grupoId);
  return grupoId ? grupo.data : undefined;
};

/** Lee `:grupoId` de la URL y carga el grupo (con su materia). */
export const useGrupoDeRuta = () => {
  const { grupoId = '' } = useParams<{ grupoId: string }>();
  const grupo = useGrupo(grupoId);
  return { grupoId, grupo };
};

/** Lee `:grupoId` y `:semana` de la URL; `materiaId` sale del grupo. */
export const useParametrosSemana = () => {
  const params = useParams<{ semana: string }>();
  const { grupoId, grupo } = useGrupoDeRuta();
  const semana = Number(params.semana);
  return { grupoId, semana, grupo, materiaId: grupo.data?.materia.id ?? '' };
};
