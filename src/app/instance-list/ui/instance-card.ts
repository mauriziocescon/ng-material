import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ValidityStateDirective } from '../../shared/validity-state.directive';

import { Instance } from '../models/instance';

@Component({
  selector: 'app-instance-card',
  imports: [
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    ValidityStateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
        <mat-card-subtitle>
          <span>{{ blocksCounter() }}</span>
          <span class="validity-state" appValidityState [valid]="validityState()"></span>
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>{{ bodyText() }}</mat-card-content>
      <mat-card-actions align="end">
        <button mat-button color="primary" (click)="selectInstance()">
          {{ "COMPONENT.INSTANCE.SHOW" | transloco }}
        </button>
      </mat-card-actions>
    </mat-card>`,
  styles: `
    .validity-state {
      padding-left: 15px;
    }`,
})
export class InstanceCard {
  router = inject(Router);

  instance = input.required<Instance>();

  title = computed(() => this.instance()?.id);
  bodyText = computed(() => this.instance()?.description);
  validityState = computed(() => this.instance()?.blocks.every(i => i.valid === true));
  blocksCounter = computed(() => {
    const validBlocks = this.instance()?.blocks.filter(b => b.valid === true).length;
    return `(${validBlocks} / ${this.instance()?.blocks.length})`;
  });

  selectInstance(): void {
    this.router.navigateByUrl(`/instance-detail/${this.instance().id}`);
  }
}
