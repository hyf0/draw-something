import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { deepOrange } from '@material-ui/core/colors'
import React from 'react';

const theme = createMuiTheme({
  palette: {
    // type: 'dark',
    primary: {
      light: deepOrange[500],
      main: deepOrange[500],
      dark: deepOrange[500],
    },
  },
});

export default function CustomThemeLayout({ children }: { children: any }) {
  return (
    <ThemeProvider theme={theme}>
     {children}
    </ThemeProvider>
  );
}
