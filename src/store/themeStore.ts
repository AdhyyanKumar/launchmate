  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';

  type Theme = 'light' | 'dark' | 'contrast';

  interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
  }

  export const useThemeStore = create<ThemeState>()(
    persist(
      (set) => ({
        theme: 'light',
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'theme-storage',
      }
    )
  );

  export const getThemeClasses = (theme: Theme) => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-gray-900',
          sidebar: 'bg-gray-800',
          text: 'text-gray-100',
          subtext: 'text-gray-400',
          card: 'bg-gray-800',
          border: 'border-gray-700',
          hover: 'hover:bg-gray-700',
          button: 'bg-gray-700 hover:bg-gray-600',
          accent: 'text-indigo-400',
          dropdown: 'bg-gray-800 border-gray-700',
          tag: 'bg-gray-700 text-white',
          input: 'bg-gray-800 text-white border-gray-600',
          focusRing: 'focus:outline-none focus:ring-2 focus:ring-indigo-500'
        };
      case 'contrast':
        return {
          background: 'bg-black',
          sidebar: 'bg-gray-900',
          text: 'text-white',
          subtext: 'text-gray-300',
          card: 'bg-gray-900',
          border: 'border-gray-800',
          hover: 'hover:bg-gray-800',
          button: 'bg-gray-800 hover:bg-gray-700',
          accent: 'text-indigo-300',
          dropdown: 'bg-gray-900 border-gray-800',
          tag: 'bg-white text-black',
          input: 'bg-gray-900 text-white border-gray-700',
          focusRing: 'focus:outline-none focus:ring-2 focus:ring-indigo-400'
        };
      default:
        return {
          background: 'bg-gray-50',
          sidebar: 'bg-white',
          text: 'text-gray-900',
          subtext: 'text-gray-600',
          card: 'bg-white',
          border: 'border-gray-200',
          hover: 'hover:bg-gray-50',
          button: 'bg-gray-50 hover:bg-gray-100',
          accent: 'text-indigo-600',
          dropdown: 'bg-white border-gray-200',
          tag: 'bg-gray-200 text-black',
          input: 'bg-white text-black border-gray-300',
          focusRing: 'focus:outline-none focus:ring-2 focus:ring-indigo-500'
        };
    }
  };
