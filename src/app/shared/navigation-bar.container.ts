import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AppLanguageService } from '../core/app-language.service';

import { NavigationBarComponent } from './navigation-bar.component';

@Component({
  selector: 'app-navigation-bar-ct',
  standalone: true,
  imports: [
    NavigationBarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-bar-cp
      [languages]="languages"
      [selectedLanguageId]="language()"
      (languageDidChange)="selectLanguage($event)"
      (navigationDidChange)="goTo($event)"/>`,
})
export class NavigationBarContainerComponent {
  private router = inject(Router);
  private appLanguage = inject(AppLanguageService);

  languages = this.appLanguage.getSupportedLanguagesList();
  language = signal<string>(this.appLanguage.getLanguageId());

  selectLanguage(language: string): void {
    this.appLanguage.setLanguageId(language);
  }

  goTo(route: { path: string }): void {
    this.router.navigateByUrl(route.path);
  }
}
