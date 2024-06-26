import {
  Component,
  OnInit,
  OnDestroy,
  input,
  output,
  effect,
  untracked,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

import { ValidityStateDirective } from '../../../../../shared/validity-state.directive';

import { DatePickerBlock } from './date-picker.model';

@Component({
  selector: 'app-date-picker-cp',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    ValidityStateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "COMPONENT.DATE_PICKER.HEADER" | transloco }}</div>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="outline" class="card-content">
          <mat-label>{{ label() | transloco }}</mat-label>
          <input matInput [matDatepicker]="picker1" [formControl]="control"/>
          <mat-hint>MM/DD/YYYY</mat-hint>
          <mat-datepicker-toggle matIconSuffix [for]="picker1"/>
          <mat-datepicker #picker1/>
        </mat-form-field>
      </mat-card-content>
      <mat-card-actions>
        <span appValidityState [valid]="valid()"></span>
      </mat-card-actions>
    </mat-card>`,
})
export class DatePickerComponent implements OnInit, OnDestroy {
  block = input.required<DatePickerBlock>();
  valueDidChange = output<string | undefined>();

  label = computed(() => this.block().label);
  description = computed(() => this.block().description);
  valid = computed(() => this.block().valid);

  control = new FormControl<string>('');
  private controlSubscription: Subscription | undefined;

  private blockWatcher = effect(() => {
    this.block();
    untracked(() => this.setupController());
  });

  ngOnInit(): void {
    this.setupController();
    this.subscribeValueChanges();
  }

  ngOnDestroy(): void {
    this.controlSubscription?.unsubscribe();
  }

  private setupController(): void {
    this.setDisableEnable(this.block().disabled, this.control);
    this.control.setValue(this.block().value ?? null, { emitEvent: false });
  }

  private subscribeValueChanges(): void {
    this.controlSubscription?.unsubscribe();

    this.controlSubscription = this.control
      .valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), skip(1))
      .subscribe(value => this.valueDidChange.emit(value ?? undefined));
  }

  private setDisableEnable(condition: boolean, control: FormControl): void {
    if (condition) {
      control.disable();
    } else {
      control.enable();
    }
  }
}
