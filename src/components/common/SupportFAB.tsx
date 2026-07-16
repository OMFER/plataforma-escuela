import { OPENCLASS_TEXTS } from '../../constants/texts';

export const SupportFAB = () => {
  return (
    <button className="fixed right-6 bottom-20 md:bottom-10 bg-primary text-on-primary w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 group">
      <span className="material-symbols-outlined">chat</span>
      <span className="absolute right-full mr-4 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-lg text-body-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {OPENCLASS_TEXTS.fabSupport}
      </span>
    </button>
  );
};