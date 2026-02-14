import * as eva from '@eva-design/eva';

export const lightTheme = {
  ...eva.light,
  // Primary colors
  'color-primary-100': '#E8F5E9', // soft green
  'color-primary-200': '#C8E6C9',
  'color-primary-300': '#A5D6A7',
  'color-primary-400': '#81C784',
  'color-primary-500': '#4CAF50', // main green
  'color-primary-600': '#43A047',
  'color-primary-700': '#388E3C',
  'color-primary-800': '#2E7D32',
  'color-primary-900': '#1B5E20',

  // Accent / orange
  'color-accent-500': '#FF9800',
  'color-accent-600': '#F57C00',

  // Backgrounds
  'background-basic-color-1': '#FFFFFF', // main background
  'background-basic-color-2': '#FFFDE7', // secondary background
  'background-basic-color-3': '#F1F8E9', // subtle surfaces

  // Text
  'text-basic-color': '#333333',
  'text-disabled-color': '#AAAAAA',
  'text-hint-color': '#777777',
};

export const darkTheme = {
  // Primary colors (slightly brighter for contrast)
  'color-primary-100': '#1B5E20',
  'color-primary-200': '#2E7D32',
  'color-primary-300': '#388E3C',
  'color-primary-400': '#43A047',
  'color-primary-500': '#4CAF50', // main green
  'color-primary-600': '#81C784',
  'color-primary-700': '#A5D6A7',
  'color-primary-800': '#C8E6C9',
  'color-primary-900': '#E8F5E9',

  // Accent / orange
  'color-accent-500': '#FF9800',
  'color-accent-600': '#F57C00',

  // Backgrounds
  'background-basic-color-1': '#121212', // main dark
  'background-basic-color-2': '#1E1E1E', // secondary surface
  'background-basic-color-3': '#2A2A2A', // additional surface

  // Text
  'text-basic-color': '#FFFFFF',
  'text-disabled-color': '#AAAAAA',
  'text-hint-color': '#CCCCCC',
};
