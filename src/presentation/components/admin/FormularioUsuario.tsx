import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PASSWORD_MIN, ROLES } from '../../../domain/entities/Usuario';
import { ETIQUETAS_ROL } from '../../constants/textos';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { Campo } from '../common/Campo';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';

const esquema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  correo: z.email({ error: 'Escribe un correo válido.' }),
  password: z.string().min(PASSWORD_MIN, `Mínimo ${PASSWORD_MIN} caracteres.`),
  rol: z.enum(ROLES),
});

type Valores = z.infer<typeof esquema>;

const VACIO: Valores = { nombre: '', correo: '', password: '', rol: 'alumno' };

export const FormularioUsuario = () => {
  const { crearUsuario } = useCasosDeUso();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Valores>({ resolver: zodResolver(esquema), defaultValues: VACIO });

  const alta = useMutation({
    mutationFn: (valores: Valores) => crearUsuario.ejecutar(valores),
    onSuccess: () => {
      reset(VACIO);
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => alta.mutate(v))} noValidate className={`${estilos.tarjeta} space-y-4`}>
      <h3 className="text-title-md font-headline-lg text-on-surface">Nueva cuenta</h3>
      <Campo etiqueta="Nombre completo" htmlFor="usuario-nombre" error={errors.nombre?.message}>
        <input id="usuario-nombre" className={estilos.input} {...register('nombre')} />
      </Campo>
      <Campo etiqueta="Correo" htmlFor="usuario-correo" error={errors.correo?.message}>
        <input id="usuario-correo" type="email" autoComplete="off" className={estilos.input} {...register('correo')} />
      </Campo>
      <Campo etiqueta="Contraseña inicial" htmlFor="usuario-password" error={errors.password?.message}>
        <input id="usuario-password" type="password" autoComplete="new-password" className={estilos.input} {...register('password')} />
      </Campo>
      <Campo etiqueta="Rol" htmlFor="usuario-rol">
        <select id="usuario-rol" className={estilos.input} {...register('rol')}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ETIQUETAS_ROL[r]}
            </option>
          ))}
        </select>
      </Campo>
      {alta.error && <MensajeError error={alta.error} />}
      {alta.isSuccess && (
        <p role="status" className="text-body-sm text-primary font-bold">
          Cuenta creada para {alta.data.nombre}.
        </p>
      )}
      <button type="submit" className={`${estilos.botonPrimario} w-full`} disabled={alta.isPending}>
        <span className="material-symbols-outlined text-[20px]">person_add</span>
        {alta.isPending ? 'Creando…' : 'Crear cuenta'}
      </button>
    </form>
  );
};
