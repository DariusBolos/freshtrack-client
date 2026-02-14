import * as eva from '@eva-design/eva';

const lightTheme = {
  ...eva.light,

  'color-primary-100': '#FFE8E5',
  'color-primary-200': '#FFC5BE',
  'color-primary-300': '#FFA094',
  'color-primary-400': '#FF7B6B',
  'color-primary-500': '#FF5A3C', // Main brand
  'color-primary-600': '#DB4127',
  'color-primary-700': '#B72D18',
  'color-primary-800': '#931C0E',
  'color-primary-900': '#7A1209',

  'background-basic-color-1': '#FFF8F3', // soft cream
  'background-basic-color-2': '#FCEEE6',
};

const darkTheme = {
  ...eva.dark, // start from Eva Dark base

  // Brand colors (kept similar for recognition, slightly muted for dark mode)
  'color-primary-100': '#7A1209',
  'color-primary-200': '#931C0E',
  'color-primary-300': '#B72D18',
  'color-primary-400': '#DB4127',
  'color-primary-500': '#FF5A3C', // Main brand, same as light for consistency
  'color-primary-600': '#FF7B6B',
  'color-primary-700': '#FFA094',
  'color-primary-800': '#FFC5BE',
  'color-primary-900': '#FFE8E5',

  // Backgrounds for dark theme
  'background-basic-color-1': '#121212', // deep dark
  'background-basic-color-2': '#1E1E1E', // slightly lighter for surfaces
  'background-basic-color-3': '#2A2A2A', // optional extra surface
  'background-basic-color-4': '#383838', // optional extra surface

  // Optional text colors (ensure contrast)
  'text-basic-color': '#FFFFFF',
  'text-disabled-color': '#AAAAAA',
  'text-hint-color': '#CCCCCC',
};

export { lightTheme, darkTheme };
