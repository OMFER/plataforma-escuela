import { useState } from 'react';
import { PanelMaterias } from '../components/admin/PanelMaterias';
import { PanelUsuarios } from '../components/admin/PanelUsuarios';

type Pestana = 'usuarios' | 'materias';

const PESTANAS: { id: Pestana; label: string }[] = [
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'materias', label: 'Materias e inscripciones' },
];

export const AdminPage = () => {
  const [pestana, setPestana] = useState<Pestana>('usuarios');

  return (
    <main className="min-h-screen">
      <div className="max-w-[1200px] mx-auto p-gutter py-8 space-y-8">
        <section className="space-y-2">
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-primary">Administración</h1>
          <p className="text-body-lg text-on-surface-variant">Da de alta cuentas y materias, e inscribe alumnos.</p>
        </section>

        <div role="tablist" className="flex border-b border-outline-variant overflow-x-auto">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={pestana === p.id}
              onClick={() => setPestana(p.id)}
              className={`px-6 py-3 text-label-caps font-label-caps whitespace-nowrap border-b-2 transition-colors ${
                pestana === p.id
                  ? 'text-primary font-bold border-primary'
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div role="tabpanel">{pestana === 'usuarios' ? <PanelUsuarios /> : <PanelMaterias />}</div>
      </div>
    </main>
  );
};
