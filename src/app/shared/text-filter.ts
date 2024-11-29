import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { outputFromObservable, toObservable } from '@angular/core/rxjs-interop';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import isEmpty from 'lodash/isEmpty';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-text-filter',
  imports: [
    FormsModule,
    TranslocoPipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field appearance="outline" class="search-field">
      <mat-label>{{ 'COMPONENT.TEXT_FILTER.PLACEHOLDER' | transloco }}</mat-label>
      <input
        type="text"
        matInput
        [(ngModel)]="value">
      @if (isNotEmpty()) {
        <button matSuffix mat-icon-button aria-label="Clear" (click)="resetTextFilter()">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>`,
  styles: `
    .search-field {
      display: flex;
      padding-left: var(--padding-s);
      padding-right: var(--padding-s);
      padding-top: var(--padding-m);
      padding-bottom: var(--padding-m);
    }`,
})
export class TextFilter {
  protected readonly value = signal('');
  protected readonly isNotEmpty = computed(() => !isEmpty(this.value()));

  protected readonly value$ = toObservable(this.value).pipe(debounceTime(500), distinctUntilChanged());
  readonly valueDidChange = outputFromObservable(this.value$);

  resetTextFilter() {
    this.value.set('');
  }
}
