import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-text-filter-cp',
  imports: [
    ReactiveFormsModule,
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
      <input matInput type="text" [formControl]="searchControl">
      @if (isTextFilterNotEmpty()) {
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
export class TextFilterComponent implements OnInit, OnDestroy {
  valueDidChange = output<string>();

  searchControl = new FormControl<string>('');
  searchControlSubscription: Subscription | undefined;

  isTextFilterNotEmpty = toSignal(this.searchControl.valueChanges.pipe(map(v => v !== '')));

  ngOnInit(): void {
    this.subscribeValueChanges();
  }

  ngOnDestroy(): void {
    this.searchControlSubscription?.unsubscribe();
  }

  resetTextFilter(): void {
    this.searchControl.setValue('');
  }

  private subscribeValueChanges(): void {
    this.searchControlSubscription?.unsubscribe();

    this.searchControlSubscription = this.searchControl
      .valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(value => this.valueDidChange.emit(value ?? ''));
  }
}
