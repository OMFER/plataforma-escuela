import { Link } from 'react-router-dom';
import type { ExamenesSemana, ResumenExamen, TipoExamen } from '../../../domain/entities/Examen';
import { rutas } from '../../routes/rutas';
import { describirVentana } from '../../utils/ventana';
import { estilos } from '../common/estilos';

interface AccionesMaestroProps {
  grupoId: string;
  semana: number;
  hayContenido: boolean;
  examenes: ExamenesSemana | undefined;
}

interface EnlaceExamenProps {
  grupoId: string;
  semana: number;
  tipo: TipoExamen;
  examen: ResumenExamen | null;
  nombre: string;
}

const EnlaceExamen = ({ grupoId, semana, tipo, examen, nombre }: EnlaceExamenProps) => (
  <div className="flex flex-col gap-1">
    <Link
      to={examen ? rutas.editarExamen(grupoId, examen.id) : rutas.nuevoExamen(grupoId, tipo, semana)}
      className={estilos.botonSecundario}
    >
      <span className="material-symbols-outlined text-[20px]">{examen ? 'edit_note' : 'post_add'}</span>
      {examen ? `Editar ${nombre}` : `Crear ${nombre}`}
    </Link>
    {examen && <p className="text-[12px] text-on-surface-variant">{describirVentana(examen.ventana)}</p>}
  </div>
);

export const AccionesMaestro = ({ grupoId, semana, hayContenido, examenes }: AccionesMaestroProps) => (
  <div className="flex flex-wrap items-start gap-3">
    <Link to={rutas.editarContenido(grupoId, semana)} className={estilos.botonSecundario}>
      <span className="material-symbols-outlined text-[20px]">{hayContenido ? 'edit' : 'add'}</span>
      {hayContenido ? 'Editar contenido' : 'Crear contenido'}
    </Link>
    {examenes && (
      <>
        <EnlaceExamen grupoId={grupoId} semana={semana} tipo="Semanal" examen={examenes.semanal} nombre="examen semanal" />
        {examenes.semanal || examenes.reposicion ? (
          <EnlaceExamen grupoId={grupoId} semana={semana} tipo="Reposicion" examen={examenes.reposicion} nombre="reposición" />
        ) : (
          <div className="flex flex-col gap-1">
            <button type="button" disabled className={estilos.botonSecundario} aria-describedby="reposicion-requiere-semanal">
              <span className="material-symbols-outlined text-[20px]">post_add</span>
              Crear reposición
            </button>
            <p id="reposicion-requiere-semanal" className="text-[12px] text-on-surface-variant">
              Primero crea el examen semanal.
            </p>
          </div>
        )}
      </>
    )}
  </div>
);
