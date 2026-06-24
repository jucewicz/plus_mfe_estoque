import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#6C63FF', dark: '#5A52E0', light: '#EAE9FF' },
    error: { main: '#E05252' },
    text: { primary: '#3D3D6B', secondary: '#9898B3' },
  },
  typography: {
    fontFamily: '"Inter", "Nunito", sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 50, textTransform: 'none', fontWeight: 700 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 24 },
      },
    },
  },
});
