import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#002060' },
    secondary: { main: '#9c27b0' },
  },
  components: {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: '#666',
        },
      },
    },
  },
});

export default theme;