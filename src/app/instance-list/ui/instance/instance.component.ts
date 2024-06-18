import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
  TemplateRef,
  contentChild,
  signal,
} from '@angular/core';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';

import { interval } from 'rxjs';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ValidityStateDirective } from '../../../shared/validity-state.directive';

import { Instance } from '../../models/instance.model';

@Component({
  selector: 'app-instance-cp',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    ValidityStateDirective,
    AsyncPipe,
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
    </mat-card>

    <input type="text" [value]="value | async" (input)="valueDidChange($event)">

    <ng-container
      [ngTemplateOutlet]="test1()"
      [ngTemplateOutletContext]="context()">
    </ng-container>
  `,
  styles: `
    .validity-state {
      padding-left: 15px;
    }
  `,
})
export class InstanceComponent {
  instance = input.required<Instance>();
  instanceSelected = output<void>();

  title = computed(() => this.instance()?.id);
  bodyText = computed(() => this.instance()?.description);
  validityState = computed(() => this.instance()?.blocks.every(i => i.valid === true));
  blocksCounter = computed(() => {
    const validBlocks = this.instance()?.blocks.filter(b => b.valid === true).length;
    return `(${validBlocks} / ${this.instance()?.blocks.length})`;
  });

  test1 = contentChild.required<TemplateRef<any>>('test1');
  context = signal({ example: '0', other: 5, $implicit: 'context_10' });

  value = interval(1000);

  valueDidChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    console.log(inputEl.value);
  }

  selectInstance(): void {
    this.instanceSelected.emit();
  }
}
