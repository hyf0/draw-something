import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import React from 'react';

const theme = createMuiTheme({
  palette: {
    // type: 'dark',
    primary: {
      main: '#ff9800',
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
