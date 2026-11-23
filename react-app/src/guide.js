// Entry for the How to Use guide (dist/how-to-use.html).
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';
import HowToUse from './pages/HowToUse';
import theme from './theme';

document.title = 'How to Use · Tatkal Ticket Booking';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ html: { scrollBehavior: 'smooth' } }} />
      <HowToUse />
    </ThemeProvider>
  </React.StrictMode>
);
