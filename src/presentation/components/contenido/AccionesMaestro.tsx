import { Link } from 'react-router-dom';
import { rutas } from '../../routes/rutas';
import { estilos } from '../common/estilos';

interface AccionesMaestroProps {
  materiaId: string;
  semana: number;
  hayContenido: boolean;
  hayExamen: boolean;
}

export const AccionesMaestro = ({ materiaId, semana, hayContenido, hayExamen }: AccionesMaestroProps) => (
  <div className="flex flex-wrap gap-3">
    <Link to={rutas.editarContenido(materiaId, semana)} className={estilos.botonSecundario}>
      <span className="material-symbols-outlined text-[20px]">{hayContenido ? 'edit' : 'add'}</span>
      {hayContenido ? 'Editar contenido' : 'Crear contenido'}
    </Link>
    <Link to={rutas.editarExamen(materiaId, semana)} className={estilos.botonSecundario}>
      <span className="material-symbols-outlined text-[20px]">{hayExamen ? 'edit_note' : 'post_add'}</span>
      {hayExamen ? 'Editar examen' : 'Crear examen'}
    </Link>
  </div>
);
