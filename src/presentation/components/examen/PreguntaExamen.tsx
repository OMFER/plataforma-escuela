import type { Pregunta } from '../../../domain/entities/Examen';

interface PreguntaExamenProps {
  indice: number;
  pregunta: Pregunta;
  seleccion: number | null;
  deshabilitada?: boolean;
  alElegir: (opcion: number) => void;
}

export const PreguntaExamen = ({ indice, pregunta, seleccion, deshabilitada, alElegir }: PreguntaExamenProps) => {
  const nombre = `pregunta-${indice}`;
  return (
    <fieldset className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant space-y-4">
      <legend className="text-title-md text-on-surface float-left w-full">
        <span className="text-primary">{indice + 1}.</span> {pregunta.enunciado}
      </legend>
      <div className="space-y-2 clear-both pt-2">
        {pregunta.opciones.map((opcion, i) => {
          const id = `${nombre}-opcion-${i}`;
          const elegida = seleccion === i;
          return (
            <label
              key={id}
              htmlFor={id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                elegida ? 'border-primary bg-secondary-container/40' : 'border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              <input
                id={id}
                type="radio"
                name={nombre}
                value={i}
                checked={elegida}
                disabled={deshabilitada}
                onChange={() => alElegir(i)}
                className="accent-primary w-4 h-4"
              />
              <span className="text-body-lg text-on-surface">{opcion}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
