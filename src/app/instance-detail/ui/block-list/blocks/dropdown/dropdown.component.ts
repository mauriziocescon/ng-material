import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  output,
  untracked,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ValidityStateDirective } from '../../../../../shared/validity-state.directive';

import { DropdownBlock } from './dropdown-block.model';

@Component({
  selector: 'app-dropdown-cp',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ValidityStateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "COMPONENT.DROPDOWN.HEADER" | transloco }}</div>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="outline" class="card-content">
          <mat-label>{{ label() | transloco }}</mat-label>
          <mat-select [formControl]="control">
            @for (value of choices(); track value) {
              <mat-option [value]="value"> {{ value }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </mat-card-content>
      <mat-card-actions>
        <span appValidityState [valid]="valid()"></span>
      </mat-card-actions>
    </mat-card>`,
})
export class DropdownComponent implements OnDestroy {
  block = input.required<DropdownBlock>();
  valueDidChange = output<string | undefined>();

  label = computed(() => this.block().label);
  choices = computed(() => this.block().choices);
  valid = computed(() => this.block().valid);

  control = new FormControl<string>('');
  private controlSubscription: Subscription | undefined;

  private blockWatcher = effect(() => {
    this.block();
    untracked(() => {
      this.controlSubscription?.unsubscribe();
      this.setupController();
      this.subscribeValueChanges();
    });
  });

  ngOnDestroy(): void {
    this.controlSubscription?.unsubscribe();
  }

  private setupController(): void {
    const validators = [...(this.block().required ? [Validators.required] : [])];
    this.control.setValidators(validators);
    this.setDisableEnable(this.block().disabled, this.control);
    this.control.setValue(this.block().value ?? null);
  }

  private subscribeValueChanges(): void {
    this.controlSubscription?.unsubscribe();

    this.controlSubscription = this.control
      .valueChanges
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
