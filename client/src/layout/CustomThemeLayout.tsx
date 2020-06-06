import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { deepOrange } from '@material-ui/core/colors'
import React from 'react';

const theme = createMuiTheme({
  palette: {
    // type: 'dark',
    primary: {
      light: '#1890ff',
      main: '#1890ff',
      dark: '#1890ff',
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
