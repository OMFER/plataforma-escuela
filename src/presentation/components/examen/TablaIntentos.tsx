import type { IntentoAlumno } from '../../../domain/entities/Examen';
import { formatearCalificacion } from '../../../domain/rules/examen';
import { formatearFechaHora } from '../../utils/fechas';

interface TablaIntentosProps {
  intentos: IntentoAlumno[];
  puntajeMaximo: number;
}

const ENCABEZADOS = ['Alumno', 'Aciertos', 'Calificación', 'Fecha'];

export const TablaIntentos = ({ intentos, puntajeMaximo }: TablaIntentosProps) => {
  if (intentos.length === 0) {
    return <p className="text-body-sm text-on-surface-variant">Ningún alumno ha respondido todavía.</p>;
  }
  const promedio = intentos.reduce((suma, i) => suma + i.calificacion, 0) / intentos.length;

  return (
    <div className="space-y-3">
      <p className="text-body-sm text-on-surface-variant">
        {intentos.length} {intentos.length === 1 ? 'respuesta' : 'respuestas'} · Promedio:{' '}
        <span className="font-bold text-primary">{formatearCalificacion(promedio, puntajeMaximo)}</span>
      </p>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low text-label-caps font-label-caps text-on-surface-variant">
            <tr>
              {ENCABEZADOS.map((h) => (
                <th key={h} scope="col" className="px-6 py-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {intentos.map((intento) => (
              <tr key={intento.id} className="hover:bg-surface-bright transition-colors">
                <td className="px-6 py-4">
                  <p className="text-body-sm font-semibold text-on-surface">{intento.alumno.nombre}</p>
                  <p className="text-[12px] text-on-surface-variant">{intento.alumno.correo}</p>
                </td>
                <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                  {intento.aciertos} / {intento.totalPreguntas}
                </td>
                <td className="px-6 py-4 text-body-sm font-bold text-primary">
                  {formatearCalificacion(intento.calificacion, puntajeMaximo)}
                </td>
                <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatearFechaHora(intento.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
