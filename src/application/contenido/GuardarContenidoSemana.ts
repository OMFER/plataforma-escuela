import type { CambiosContenidoSemana, ContenidoSemana, LinksClase, Recurso } from '../../domain/entities/Contenido';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { ContenidoRepository } from '../../domain/repositories/ContenidoRepository';

export interface SolicitudGuardarContenido {
  /** Si existe, se actualiza; si no, se crea. */
  id?: string;
  materiaId: string;
  semana: number;
  datos: CambiosContenidoSemana;
}

const limpiarRecurso = (r: Recurso): Recurso => {
  const descripcion = r.descripcion?.trim();
  return {
    tipo: r.tipo,
    titulo: r.titulo.trim(),
    url: r.url.trim(),
    ...(descripcion ? { descripcion } : {}),
  };
};

const limpiarLinks = (links?: LinksClase): LinksClase | undefined => {
  if (!links) return undefined;
  const limpio: LinksClase = {};
  for (const [clave, valor] of Object.entries(links) as [keyof LinksClase, string | undefined][]) {
    const texto = valor?.trim();
    if (texto) limpio[clave] = texto;
  }
  return limpio;
};

export class GuardarContenidoSemana {
  private readonly contenido: ContenidoRepository;

  constructor(contenido: ContenidoRepository) {
    this.contenido = contenido;
  }

  async ejecutar({ id, materiaId, semana, datos }: SolicitudGuardarContenido): Promise<ContenidoSemana> {
    const tema = datos.tema.trim();
    if (!tema) throw new ErrorAplicacion('El tema es obligatorio.', 400);

    const recursos = datos.recursos.map(limpiarRecurso);
    if (recursos.some((r) => !r.titulo || !r.url)) {
      throw new ErrorAplicacion('Cada recurso necesita título y URL.', 400);
    }

    const introduccion = datos.introduccion?.trim() ?? '';
    const cambios: CambiosContenidoSemana = {
      tema,
      // Al editar se envía '' para poder borrar la introducción; al crear se omite si está vacía.
      introduccion: id ? introduccion : introduccion || undefined,
      recursos,
      links: limpiarLinks(datos.links),
    };

    return id
      ? this.contenido.actualizar(id, cambios)
      : this.contenido.crear({ ...cambios, materiaId, semana });
  }
}
