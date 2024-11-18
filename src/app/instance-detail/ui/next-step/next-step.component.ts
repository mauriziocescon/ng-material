import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, untracked } from '@angular/core';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { UIUtilitiesService } from '../../../shared/ui-utilities.service';
import { ModalAlert } from '../../../shared/modal.model';

@Component({
  selector: 'app-next-step-cp',
  standalone: true,
  imports: [
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="next-step">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ "COMPONENT.NEXT_STEP.HEADER" | transloco }}</mat-card-title>
        </mat-card-header>
        <mat-card-actions>
          <div class="action-btns">
            <button mat-raised-button color="primary" (click)="moveToNextStep()" [disabled]="!nextStepBtnEnabled()">
              {{ "COMPONENT.NEXT_STEP.NEXT_STEP" | transloco }}
            </button>
            <div [hidden]="!isSynchronized()">
              <mat-icon>done</mat-icon>
              <span>{{ "COMPONENT.NEXT_STEP.SYNC" | transloco }}</span>
            </div>
            <div [hidden]="!isSynchronizing()">
              <mat-icon>sync</mat-icon>
              <span>{{ "COMPONENT.NEXT_STEP.SYNCING" | transloco }}</span>
            </div>
            <div [hidden]="!canRetrySync()" (click)="retrySyncronization()">
              <mat-icon>redo</mat-icon>
              <span>{{ "COMPONENT.NEXT_STEP.RETRY" | transloco }}</span>
            </div>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>`,
  styles: `
    .next-step {
      position: sticky;
      top: 0;

      .action-btns {
        display: flex;
        flex-direction: column;

        button {
          margin: var(--padding-s);
        }
      }
    }
  `,
})
export class NextStepComponent {
  private transloco = inject(TranslocoService);
  private uiUtilities = inject(UIUtilitiesService);

  nextStepBtnEnabled = input.required<boolean>();
  syncing = input.required<boolean>();
  syncError = input.required<string | undefined>();
  nextStep = output<void>();
  resetSelections = output<void>();
  retrySync = output<void>();

  isSynchronizing = computed(() => this.syncing());
  isSynchronized = computed(() => !this.isSynchronizing() && this.syncError() === undefined);
  canRetrySync = computed(() => !this.isSynchronizing() && this.syncError() !== undefined);

  private syncErrorWatcher = effect(() => {
    this.syncError();
    untracked(() => this.showModalError());
  });

  moveToNextStep(): void {
    this.nextStep.emit();
  }

  reset(): void {
    this.resetSelections.emit();
  }

  retrySyncronization(): void {
    this.retrySync.emit();
  }

  private showModalError(): void {
    if (this.syncError()) {
      const modalAlert: ModalAlert = {
        id: 'blockListError',
        title: this.transloco.translate('CONTAINER.BLOCK_LIST.ALERT_TITLE'),
        message: this.syncError() as string,
        buttonLabel: this.transloco.translate('CONTAINER.BLOCK_LIST.ALERT_BUTTON'),
      };
      this.uiUtilities.modalAlert(modalAlert);
    }
  }
}
