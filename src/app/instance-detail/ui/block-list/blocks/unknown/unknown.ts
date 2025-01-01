import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-unknown-cp',
  imports: [
    TranslocoPipe,
    MatCardModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "UNKNOWN.HEADER" | transloco }}</div>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        {{ "UNKNOWN.ALERT_MSG" | transloco }}
      </mat-card-content>
    </mat-card>`,
})
export class Unknown {
  instanceId = input.required<string>();
  block = input.required<unknown>();
}
