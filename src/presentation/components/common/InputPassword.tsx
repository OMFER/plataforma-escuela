import { useState, type ComponentProps } from 'react';
import { estilos } from './estilos';

type InputPasswordProps = Omit<ComponentProps<'input'>, 'type'>;

/** Campo de contraseña con un botón para ver u ocultar lo que se escribe. */
export const InputPassword = ({ className, ...props }: InputPasswordProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`${className ?? estilos.input} pr-12`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
        aria-pressed={visible}
        title={visible ? 'Ocultar' : 'Ver'}
        className={`${estilos.botonIcono} absolute inset-y-0 right-1 my-auto h-fit`}
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          {visible ? 'visibility_off' : 'visibility'}
        </span>
      </button>
    </div>
  );
};
