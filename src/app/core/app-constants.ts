import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

export class Api {
  instances = `${environment.apiUrl}instances`;
  blocks = `${environment.apiUrl}blocks`;
}

export class Application {
  APP_NAME = 'ngrx-app';
  SHOW_JSON_SERVER_API = !environment.production;
  JSON_SERVER_API_URL = environment.apiUrl;
}

export class Languages {
  DE = 'de';
  EN = 'en';
  IT = 'it';
  SUPPORTED_LANG = ['de', 'en', 'it'];
  SUPPORTED_LANG_DESC = ['Deutsch', 'English', 'Italiano'];
  DEFAULT_LANGUAGE = 'en';
}

export class LocalStorageKey {
  LANGUAGE_ID = 'LANGUAGE_ID';
}

/**
 * Get application constants
 * grouped by field
 */
@Injectable({
  providedIn: 'root',
})
export class AppConstants {
  private api = new Api();
  private application = new Application();
  private languages = new Languages();
  private localStorageKey = new LocalStorageKey();

  get Api() {
    return this.api;
  }

  get Application() {
    return this.application;
  }

  get Languages() {
    return this.languages;
  }

  get LocalStorageKey() {
    return this.localStorageKey;
  }
}
