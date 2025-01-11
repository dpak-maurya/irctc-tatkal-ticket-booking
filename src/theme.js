import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#415F91', // Similar to rgb(65, 95, 145)
      contrastText: '#FFFFFF', // White for contrast
    },
   
    background: {
      default: '#FAFAFC', // Light neutral background
      paper: '#FFFFFF', // Paper color
    },
    surface: {
      main: '#D6E3FF', // Light blue shade for surface elements, inspired by Material 3 tones
    },
    error: {
      main: '#BA1A1A', // Red for errors
    },
    warning: {
      main: '#F9A825', // Warning yellow shade
    },
    info: {
      main: '#0288D1', // Light blue for informational elements
    },
    success: {
      main: '#388E3C', // Green for success notifications
    },
    text: {
      primary: '#1A1A1A', // Dark gray for main text
      secondary: '#5F6368', // Gray for secondary text, inspired by Google Material
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    action: {
      active: '#415F91',
      hover: 'rgba(65, 95, 145, 0.08)',
      selected: 'rgba(65, 95, 145, 0.14)',
      disabled: 'rgba(65, 95, 145, 0.26)',
      disabledBackground: 'rgba(65, 95, 145, 0.12)',
    },
  },
  shape: {
    borderRadius: 10, // Slightly rounded edges, Material Design aesthetic
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
  
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'read', // Primary color
          color: '#FFFFFF', // White text for contrast
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#F9FAFB', // Soft neutral for better text contrast
          color: '#1E2A38', // Dark text for readability
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          padding: 16,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
          color: '#1E2A38', // Darker text color for readability
        },
      },
    },
  },
  
});

export default theme;
