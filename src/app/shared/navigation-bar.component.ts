import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppConstants } from '../core/app-constants';

@Component({
  selector: 'app-navigation-bar-cp',
  imports: [
    TranslocoPipe,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar color="primary">
      <span>{{ "COMPONENT.NAVIGATION_BAR.NAME" | transloco }}</span>
      <button mat-button aria-label="go to instances" (click)="goToInstanceList()">
        {{ "COMPONENT.NAVIGATION_BAR.INSTANCES" | transloco }}
      </button>

      <span class="spacer"></span>

      @if (canOpenJsonServer) {
        <button mat-icon-button aria-label="open json server" (click)="openJsonServer()">
          <mat-icon>dns</mat-icon>
        </button>
      }

      <button mat-button [matMenuTriggerFor]="menu" aria-label="selected language">
        {{ selectedLanguageId() }}
      </button>
      <mat-menu #menu="matMenu">
        @for (language of languages(); track language) {
          <button mat-menu-item (click)="selectLanguage(language)">
            <span>{{ language }}</span>
          </button>
        }
      </mat-menu>

    </mat-toolbar>`,
  styles: `
    .spacer {
      flex: 1 1 auto;
    }`,
})
export class NavigationBarComponent {
  private appConstants = inject(AppConstants);

  languages = input.required<string[]>();
  selectedLanguageId = input.required<string>();
  languageDidChange = output<string>();
  navigationDidChange = output<{ path: string }>();

  get canOpenJsonServer(): boolean {
    return this.appConstants.Application.SHOW_JSON_SERVER_API === true;
  }

  selectLanguage(language: string): void {
    this.languageDidChange.emit(language);
  }

  goToInstanceList(): void {
    this.navigationDidChange.emit({ path: '/instance-list' });
  }

  openJsonServer(): void {
    window.open(this.appConstants.Application.JSON_SERVER_API_URL);
  }
}
