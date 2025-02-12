import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeSwitch, theme } from "@/libs/theme";
import { AppQueryClientProvider } from "@/libs/common";

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning style={{ overflowY: "scroll" }}>
      <body>
        <AppQueryClientProvider>
          <InitColorSchemeScript attribute="class" />
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <ThemeProvider theme={theme}>
              {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
              <CssBaseline />
              <main>
                <ThemeSwitch />
                {props.children}
              </main>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </AppQueryClientProvider>
      </body>
    </html>
  );
}
