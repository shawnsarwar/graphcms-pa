import { createMuiTheme } from '@material-ui/core/styles';

export const themeBold = createMuiTheme({
    palette: {
        type: 'dark'
    },
    typography: {
      fontFamily: [
        '"sans-serif"',
        '"Roboto"',
        '"Helvetica Neue"',
        '"Segoe UI SemiBold"',
      ].join(','),
    fontSize: 12
    },
  });

export const themeNormal = createMuiTheme({
    palette: {
        type: 'dark'
    },
    typography: {
      fontFamily: [
        '"sans-serif"',
        '"Roboto"',
        '"Helvetica Neue"',
        '"Segoe UI"'
      ].join(','),
      fontSize: 12
    },
  });
