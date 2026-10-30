import { useParams } from 'react-router-dom';
import { useMisMaterias } from './consultas';

/** Lee `:materiaId` y `:semana` de la URL y localiza la materia en la caché de "mis materias". */
export const useParametrosSemana = () => {
  const params = useParams<{ materiaId: string; semana: string }>();
  const materiaId = params.materiaId ?? '';
  const semana = Number(params.semana);
  const misMaterias = useMisMaterias();
  const materia = misMaterias.data?.find((m) => m.id === materiaId);
  return { materiaId, semana, materia, cargandoMateria: misMaterias.isPending };
};
