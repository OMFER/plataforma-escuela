import { useParams } from 'react-router-dom';
import { useGrupo } from './consultas';

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
