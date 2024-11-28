import { TestBed } from '@angular/core/testing';

import { TranslocoTestingModule } from '@jsverse/transloco';

import { NavigationBarContainerComponent } from './shared/navigation-bar.container';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { de: {}, en: {}, it: {} },
          translocoConfig: {
            availableLangs: ['de', 'en', 'it'],
            defaultLang: 'en',
          },
          preloadLangs: true,
        }),
        NavigationBarContainerComponent,
        AppComponent,
      ],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
