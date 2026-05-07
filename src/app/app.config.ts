import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHashbrown } from '@hashbrownai/angular';
import { MERMAID_OPTIONS, provideMarkdown } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHashbrown({
      baseUrl: '/api/chat',
      middleware: [
        (req) => {
          console.log('[Hashbrown Request]', req.body?.toString());
          return req;
        }
      ]
    }),
    provideMarkdown({
      mermaidOptions: {
        provide: MERMAID_OPTIONS,
        useValue: {
          darkMode: false,
          look: 'classic',
        },
      },
    }),
  ],
};
