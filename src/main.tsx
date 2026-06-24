import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { EstoqueDashboardPage } from './pages/EstoqueDashboardPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EstoqueDashboardPage />
    </ThemeProvider>
  </StrictMode>,
);
