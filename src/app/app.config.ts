import {
  ApplicationConfig,
  inject,
  isDevMode,
  LOCALE_ID,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideTransloco } from '@jsverse/transloco';

import { AppLanguageService } from './core/app-language.service';
import { TranslocoHttpLoader } from './core/transloco-loader.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideTransloco({
      config: {
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    {
      provide: LOCALE_ID,
      useFactory: () => inject(AppLanguageService).getLanguageId(),
    },
  ],
};
