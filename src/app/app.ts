import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavigationBar } from './shared/navigation-bar';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavigationBar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-bar/>
    <router-outlet/>`,
})
export class AppComponent {
}
