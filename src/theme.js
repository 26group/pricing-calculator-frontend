import { createTheme } from '@mui/material/styles';

// Horizon UI inspired theme colors
const horizonColors = {
  brand: {
    50: '#E9E3FF',
    100: '#C0B8FE',
    200: '#A195FD',
    300: '#8171FC',
    400: '#7551FF',
    500: '#422AFB',
    600: '#3311DB',
    700: '#2111A5',
    800: '#190793',
    900: '#11047A',
  },
  navy: {
    50: '#d0dcfb',
    100: '#aac0fe',
    200: '#a3b9f8',
    300: '#728fea',
    400: '#3652ba',
    500: '#1b3bbb',
    600: '#24388a',
    700: '#1B254B',
    800: '#111c44',
    900: '#0b1437',
  },
  gray: {
    50: '#f8f9fa',
    100: '#edf2f7',
    200: '#e9ecef',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#adb5bd',
    600: '#A3AED0',
    700: '#707eae',
    800: '#252f40',
    900: '#1b2559',
  },
  lightPrimary: '#F4F7FE',
  blueSecondary: '#4318FF',
  brandLinear: '#868CFF',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: horizonColors.brand[500],
      light: horizonColors.brand[400],
      dark: horizonColors.brand[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: horizonColors.navy[700],
      light: horizonColors.navy[500],
      dark: horizonColors.navy[800],
      contrastText: '#ffffff',
    },
    background: {
      default: horizonColors.lightPrimary,
      paper: '#ffffff',
    },
    text: {
      primary: horizonColors.navy[700],
      secondary: horizonColors.gray[600],
    },
    divider: horizonColors.gray[200],
    error: {
      main: '#f53939',
      light: '#f87171',
      dark: '#ea0606',
    },
    success: {
      main: '#05cd99',
      light: '#4ade80',
      dark: '#17ad37',
    },
    warning: {
      main: '#ffb547',
      light: '#fcd34d',
      dark: '#f59e0b',
    },
    info: {
      main: '#4318FF',
      light: '#868CFF',
      dark: '#2111A5',
    },
  },
  typography: {
    fontFamily: '"DM Sans", "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Public Sans", sans-serif',
      fontWeight: 700,
      color: horizonColors.navy[700],
    },
    h2: {
      fontFamily: '"Public Sans", sans-serif',
      fontWeight: 700,
      color: horizonColors.navy[700],
    },
    h3: {
      fontFamily: '"Public Sans", sans-serif',
      fontWeight: 700,
      color: horizonColors.navy[700],
    },
    h4: {
      fontFamily: '"Public Sans", sans-serif',
      fontWeight: 700,
      color: horizonColors.navy[700],
    },
    h5: {
      fontFamily: '"Public Sans", sans-serif',
      fontWeight: 600,
      color: horizonColors.navy[700],
    },
    h6: {
      fontFamily: '"Public Sans", sans-serif',
      fontWeight: 600,
      color: horizonColors.navy[700],
    },
    subtitle1: {
      color: horizonColors.gray[600],
    },
    subtitle2: {
      color: horizonColors.gray[600],
    },
    body1: {
      color: horizonColors.navy[700],
    },
    body2: {
      color: horizonColors.gray[600],
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(112, 144, 176, 0.06)',
    '0px 4px 8px rgba(112, 144, 176, 0.08)',
    '0px 6px 12px rgba(112, 144, 176, 0.1)',
    '0px 8px 16px rgba(112, 144, 176, 0.12)',
    '0px 10px 20px rgba(112, 144, 176, 0.14)',
    '0px 12px 24px rgba(112, 144, 176, 0.16)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.1)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.12)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.14)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.16)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.2)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.22)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.24)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.26)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.28)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.3)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.32)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.34)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.36)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.38)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.4)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.42)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: horizonColors.lightPrimary,
          fontFeatureSettings: '"kern"',
          WebkitFontSmoothing: 'antialiased',
          letterSpacing: '-0.5px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: horizonColors.navy[700],
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
          borderRadius: 0,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '70px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 20px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${horizonColors.brandLinear} 0%, ${horizonColors.brand[500]} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${horizonColors.brand[400]} 0%, ${horizonColors.brand[600]} 100%)`,
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${horizonColors.brandLinear} 0%, ${horizonColors.brand[500]} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${horizonColors.brand[400]} 0%, ${horizonColors.brand[600]} 100%)`,
          },
        },
        outlined: {
          borderColor: horizonColors.gray[300],
          color: horizonColors.navy[700],
          '&:hover': {
            borderColor: horizonColors.brand[500],
            backgroundColor: horizonColors.brand[50],
          },
        },
        text: {
          color: horizonColors.navy[700],
          '&:hover': {
            backgroundColor: horizonColors.lightPrimary,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
          border: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
        },
        elevation1: {
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: horizonColors.gray[200],
            },
            '&:hover fieldset': {
              borderColor: horizonColors.brand[300],
            },
            '&.Mui-focused fieldset': {
              borderColor: horizonColors.brand[500],
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          '& fieldset': {
            borderColor: horizonColors.gray[200],
          },
          '&:hover fieldset': {
            borderColor: horizonColors.brand[300],
          },
          '&.Mui-focused fieldset': {
            borderColor: horizonColors.brand[500],
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          fontWeight: 500,
        },
        filled: {
          backgroundColor: horizonColors.lightPrimary,
          color: horizonColors.brand[500],
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: '0 8px',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: horizonColors.lightPrimary,
            color: horizonColors.gray[600],
            fontWeight: 600,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: 'none',
            padding: '16px',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: horizonColors.lightPrimary,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${horizonColors.gray[100]}`,
          padding: '16px',
          color: horizonColors.navy[700],
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '20px',
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          color: horizonColors.navy[700],
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: '20px',
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
          marginTop: '8px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          margin: '4px 8px',
          padding: '10px 16px',
          '&:hover': {
            backgroundColor: horizonColors.lightPrimary,
          },
          '&.Mui-selected': {
            backgroundColor: horizonColors.brand[50],
            '&:hover': {
              backgroundColor: horizonColors.brand[100],
            },
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: horizonColors.navy[700],
          border: `1px solid ${horizonColors.gray[200]} !important`,
          borderRadius: '12px',
          transition: 'all 0.2s ease-in-out',
          minHeight: '3.5em',
          padding: '8px 12px',
          lineHeight: 1.4,
          '&:hover:not(.Mui-disabled)': {
            backgroundColor: horizonColors.lightPrimary,
            borderColor: `${horizonColors.brand[500]} !important`,
          },
          '&.Mui-selected': {
            background: `linear-gradient(135deg, ${horizonColors.brandLinear} 0%, ${horizonColors.brand[500]} 100%)`,
            color: '#ffffff',
            borderColor: `${horizonColors.brand[500]} !important`,
            fontWeight: 600,
            '&:hover': {
              background: `linear-gradient(135deg, ${horizonColors.brand[400]} 0%, ${horizonColors.brand[600]} 100%)`,
            },
          },
          '&.Mui-disabled': {
            backgroundColor: horizonColors.gray[100],
            color: horizonColors.gray[400],
            opacity: 0.6,
            border: `1px solid ${horizonColors.gray[200]} !important`,
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
        indicator: {
          backgroundColor: horizonColors.brand[500],
          borderRadius: '10px',
          height: '3px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          color: horizonColors.gray[600],
          '&.Mui-selected': {
            color: horizonColors.brand[500],
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
        },
        switchBase: {
          padding: 0,
          margin: 2,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: horizonColors.brand[500],
              opacity: 1,
            },
          },
        },
        thumb: {
          width: 22,
          height: 22,
        },
        track: {
          borderRadius: 13,
          backgroundColor: horizonColors.gray[200],
          opacity: 1,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          backgroundColor: horizonColors.gray[200],
        },
        bar: {
          borderRadius: '10px',
          backgroundColor: horizonColors.brand[500],
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: horizonColors.brand[500],
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: '#dcfce7',
          color: '#166534',
          '& .MuiAlert-icon': {
            color: '#16a34a',
          },
        },
        standardError: {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          '& .MuiAlert-icon': {
            color: '#dc2626',
          },
        },
        standardWarning: {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          '& .MuiAlert-icon': {
            color: '#d97706',
          },
        },
        standardInfo: {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          '& .MuiAlert-icon': {
            color: '#2563eb',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: horizonColors.navy[700],
          borderRadius: '10px',
          fontSize: '12px',
          padding: '8px 12px',
        },
        arrow: {
          color: horizonColors.navy[700],
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: horizonColors.brand[100],
          color: horizonColors.brand[500],
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          '&:hover': {
            backgroundColor: horizonColors.lightPrimary,
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${horizonColors.brandLinear} 0%, ${horizonColors.blueSecondary} 100%)`,
          boxShadow: '0 8px 20px rgba(67, 24, 255, 0.3)',
          '&:hover': {
            background: `linear-gradient(135deg, ${horizonColors.brand[400]} 0%, ${horizonColors.brand[600]} 100%)`,
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          '&.Mui-selected': {
            backgroundColor: horizonColors.lightPrimary,
            '&:hover': {
              backgroundColor: horizonColors.gray[100],
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          '&:hover': {
            backgroundColor: horizonColors.lightPrimary,
          },
          '&.Mui-selected': {
            backgroundColor: horizonColors.lightPrimary,
            borderLeft: `3px solid ${horizonColors.brand[500]}`,
            '&:hover': {
              backgroundColor: horizonColors.gray[100],
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: horizonColors.gray[100],
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: horizonColors.gray[100],
          borderRadius: '10px',
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepConnector-line': {
            borderColor: horizonColors.gray[200],
          },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontWeight: 500,
          '&.Mui-active': {
            fontWeight: 600,
            color: horizonColors.brand[500],
          },
          '&.Mui-completed': {
            fontWeight: 600,
            color: horizonColors.brand[500],
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: horizonColors.gray[300],
          '&.Mui-active': {
            color: horizonColors.brand[500],
          },
          '&.Mui-completed': {
            color: horizonColors.brand[500],
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: horizonColors.brand[500],
        },
        thumb: {
          backgroundColor: horizonColors.brand[500],
          '&:hover, &.Mui-focusVisible': {
            boxShadow: `0 0 0 8px ${horizonColors.brand[50]}`,
          },
        },
        track: {
          background: `linear-gradient(135deg, ${horizonColors.brandLinear} 0%, ${horizonColors.brand[500]} 100%)`,
          border: 'none',
        },
        rail: {
          backgroundColor: horizonColors.gray[200],
        },
        valueLabel: {
          borderRadius: '10px',
          backgroundColor: horizonColors.brand[500],
        },
        mark: {
          backgroundColor: horizonColors.gray[300],
        },
        markLabel: {
          color: horizonColors.gray[600],
        },
      },
    },
  },
});

// Export colors for use in custom components
export { horizonColors };
export default theme;