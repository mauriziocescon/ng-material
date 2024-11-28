import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  untracked,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { ValidityStateDirective } from '../../../../../shared/validity-state.directive';

import { InstanceDetailStore } from '../../../../store/instance-detail-store';

import { TextInputBlock } from './text-input-block';

@Component({
  selector: 'app-text-input',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ValidityStateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "COMPONENT.TEXT_INPUT.HEADER" | transloco }}</div>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="outline" class="card-content">
          <mat-label>{{ label() | transloco }}</mat-label>
          <input
            type="text"
            matInput
            [formControl]="control"
            placeholder="{{ 'COMPONENT.TEXT_INPUT.TEXT_INPUT_PLACEHOLDER' | transloco }}"/>
          @if (isTextInputNotEmpty()) {
            <button matSuffix mat-icon-button aria-label="Clear" (click)="resetTextInput()">
              <mat-icon>close</mat-icon>
            </button>
          }
          <mat-hint>{{ inputGroupMessage() | transloco: inputGroupParams() }}</mat-hint>
        </mat-form-field>
      </mat-card-content>
      <mat-card-actions>
        <span appValidityState [valid]="valid()"></span>
      </mat-card-actions>
    </mat-card>`,
})
export class TextInput implements OnDestroy {
  private readonly instanceDetailStore = inject(InstanceDetailStore);

  readonly instanceId = input.required<string>();
  readonly blockId = input.required<string>();

  protected readonly block = computed<TextInputBlock>(() => {
    return this.instanceDetailStore.getBlock(this.blockId())() as TextInputBlock;
  });

  protected readonly label = computed(() => this.block().label);
  protected readonly isTextInputNotEmpty = computed(() => !!this.block().value);
  protected readonly inputGroupMessage = computed(() => {
    const minLength = this.block().minLength ?? -1;
    const maxLength = this.block().maxLength ?? -1;

    if (minLength >= 0 && maxLength >= 0) {
      return 'COMPONENT.TEXT_INPUT.TEXT_INPUT_MSG_MIN_MAX_LENGTH';
    } else if (minLength >= 0) {
      return 'COMPONENT.TEXT_INPUT.TEXT_INPUT_MSG_MIN_LENGTH';
    } else if (maxLength >= 0) {
      return 'COMPONENT.TEXT_INPUT.TEXT_INPUT_MSG_MAX_LENGTH';
    } else {
      return ``;
    }
  });
  protected readonly inputGroupParams = computed(() => {
    const minLength = this.block().minLength ?? -1;
    const maxLength = this.block().maxLength ?? -1;

    if (minLength >= 0 && maxLength >= 0) {
      return {
        minLength: this.block().minLength,
        maxLength: this.block().maxLength,
      };
    } else if (minLength >= 0) {
      return {
        minLength: this.block().minLength,
      };
    } else if (maxLength >= 0) {
      return {
        maxLength: this.block().maxLength,
      };
    } else {
      return undefined;
    }
  });
  protected readonly valid = computed(() => this.block().valid);

  readonly control = new FormControl<string>('');
  private controlSubscription: Subscription | undefined = undefined;

  private readonly blockWatcher = effect(() => {
    this.block();
    untracked(() => {
      this.controlSubscription?.unsubscribe();
      this.setupController();
      this.subscribeValueChanges();
    });
  });

  ngOnDestroy() {
    this.controlSubscription?.unsubscribe();
  }

  resetTextInput() {
    this.control.setValue('');
  }

  private setupController() {
    const minLength = this.block().minLength ?? -1;
    const maxLength = this.block().maxLength ?? -1;

    const validators = [
      ...(this.block().required ? [Validators.required] : []),
      ...(minLength >= 0 ? [Validators.minLength(this.block().minLength as number)] : []),
      ...(maxLength >= 0 ? [Validators.maxLength(this.block().maxLength as number)] : []),
    ];
    this.control.setValidators(validators);
    this.setDisableEnable(this.block().disabled, this.control);
    this.control.setValue(this.block().value ?? null);
  }

  private subscribeValueChanges() {
    this.controlSubscription?.unsubscribe();

    this.controlSubscription = this.control
      .valueChanges
      .subscribe(value => this.valueDidChange(value ?? undefined));
  }

  private setDisableEnable(condition: boolean, control: FormControl) {
    if (condition) {
      control.disable();
    } else {
      control.enable();
    }
  }

  private valueDidChange(value: string | undefined) {
    this.instanceDetailStore.updateBlock({ instanceId: this.instanceId(), blockId: this.blockId(), value });
  }
}
