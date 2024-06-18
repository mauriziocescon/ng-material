import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { Location } from '@angular/common';

import { InstanceDetailStore } from '../../store/instance-detail.store';

import { NextStepComponent } from './next-step.component';

@Component({
  selector: 'app-next-step-ct',
  standalone: true,
  imports: [
    NextStepComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-next-step-cp
      [nextStepBtnEnabled]="instanceDetailStore.isNextStepEnable()"
      [syncing]="instanceDetailStore.isSyncingBlocks()"
      [syncError]="instanceDetailStore.syncingError()"
      (nextStep)="nextStep()"
      (resetSelections)="reset()"
      (retrySync)="retrySync()"/>`,
})
export class NextStepContainerComponent {
  private location = inject(Location);
  instanceDetailStore = inject(InstanceDetailStore);

  instanceId = input.required<string>();

  nextStep(): void {
    this.location.back();
  }

  reset(): void {
    this.location.back();
  }

  retrySync(): void {
    this.instanceDetailStore.syncBlocks({ instanceId: this.instanceId() });
  }
}
