import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavigationBarContainerComponent } from './shared/navigation-bar.container';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavigationBarContainerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-bar-ct/>
    <router-outlet/>`,
})
export class AppComponent {
}
