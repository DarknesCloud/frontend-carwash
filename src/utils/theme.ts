import { createTheme } from '@mui/material/styles';

// Paleta de colores basada en el logo de Multiservicios Astrid
const theme = createTheme({
  palette: {
    primary: {
      main: '#3d8b8b', // Teal del logo
      light: '#6eb5b5',
      dark: '#2d6565',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1e3a5f', // Azul oscuro del logo
      light: '#4a6b8a',
      dark: '#0f1d30',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e3a5f',
      secondary: '#5a5a5a',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2d3748',
          color: '#ffffff',
        },
      },
    },
  },
});

export default theme;

