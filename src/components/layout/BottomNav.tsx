import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION } from '../../constants/texts';

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant px-gutter py-2 flex justify-between items-center z-50">
      {NAVIGATION.map((item, index) => {
        const isActive = location.pathname === item.path;

        // Si es el elemento central (botón de agregar), lo renderizamos diferente
        if (index === 2) {
          return (
            <div key="add-btn" className="relative -top-6">
              <button className="w-12 h-12 bg-primary-container rounded-full shadow-lg flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};