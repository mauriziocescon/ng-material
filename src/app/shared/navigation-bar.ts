import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppConstants } from '../core/app-constants';
import { AppLanguage } from '../core/app-language';

@Component({
  selector: 'app-navigation-bar',
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
      <span>{{ "NAVIGATION_BAR.NAME" | transloco }}</span>
      <button mat-button aria-label="go to instances" (click)="goToInstanceList()">
        {{ "NAVIGATION_BAR.INSTANCES" | transloco }}
      </button>

      <span class="spacer"></span>

      @if (canOpenJsonServer()) {
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
export class NavigationBar {
  private readonly router = inject(Router);
  private readonly appConstants = inject(AppConstants);
  private readonly appLanguage = inject(AppLanguage);

  protected readonly languages = signal(this.appLanguage.getSupportedLanguagesList());
  protected readonly selectedLanguageId = signal<string>(this.appLanguage.getLanguageId());

  protected readonly canOpenJsonServer = computed(() => this.appConstants.Application.SHOW_JSON_SERVER_API === true);

  selectLanguage(language: string) {
    this.appLanguage.setLanguageId(language);
  }

  goToInstanceList() {
    this.router.navigateByUrl('/instance-list');
  }

  openJsonServer() {
    window.open(this.appConstants.Application.JSON_SERVER_API_URL);
  }
}
