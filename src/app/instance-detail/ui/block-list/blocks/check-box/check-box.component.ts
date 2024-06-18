import {
  Component,
  OnInit,
  OnDestroy,
  input,
  output,
  computed,
  effect,
  untracked,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators, ValidatorFn } from '@angular/forms';

import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ValidityStateDirective } from '../../../../../shared/validity-state.directive';

import { CheckBoxBlock } from './check-box.model';

@Component({
  selector: 'app-check-box-cp',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    ValidityStateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "COMPONENT.CHECK_BOX.HEADER" | transloco }}</div>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <label>{{ label() | transloco }}</label>
        <mat-checkbox [formControl]="control">{{ description() | transloco }}</mat-checkbox>
      </mat-card-content>
      <mat-card-actions>
        <span appValidityState [valid]="valid()"></span>
      </mat-card-actions>
    </mat-card>`,
})
export class CheckBoxComponent implements OnInit, OnDestroy {
  block = input.required<CheckBoxBlock>();
  valueDidChange = output<boolean>();

  label = computed(() => this.block().label);
  description = computed(() => this.block().description);
  valid = computed(() => this.block().valid);

  control = new FormControl<boolean>(false);
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
    const validators = [
      ...this.insertIf(this.block().required, Validators.required),
    ];
    this.control.setValidators(validators);
    this.setDisableEnable(this.block().disabled, this.control);
    this.control.setValue(this.block()?.value ?? false, { emitEvent: false });
  }

  private subscribeValueChanges(): void {
    this.controlSubscription?.unsubscribe();

    this.controlSubscription = this.control
      .valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), skip(1))
      .subscribe(value => this.valueDidChange.emit(value ?? false));
  }

  private setDisableEnable(condition: boolean, control: FormControl): void {
    if (condition) {
      control.disable();
    } else {
      control.enable();
    }
  }

  private insertIf(condition: boolean, element: ValidatorFn): ValidatorFn[] {
    return condition ? [element] : [];
  }
}
