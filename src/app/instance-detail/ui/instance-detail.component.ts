import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

import { BlockListContainerComponent } from './block-list/block-list.container';
import { NextStepContainerComponent } from './next-step/next-step.container';

@Component({
  selector: 'app-instance-detail-cp',
  imports: [
    BlockListContainerComponent,
    NextStepContainerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="instance-detail">
      <div [class]="nextStep()">
        <app-next-step-ct [instanceId]="instanceId()"/>
      </div>
      <div [class]="blockList()">
        <app-block-list-ct [instanceId]="instanceId()"/>
      </div>
    </div>`,
  styles: `
    .instance-detail {
      display: flex;
      flex-flow: wrap;
      width: 100%;
    }

    .col-2 {
      flex: 0 0 auto;
      width: 16.66666667%;
    }

    .col-4 {
      flex: 0 0 auto;
      width: 33.33333333%;
    }

    .col-8 {
      flex: 0 0 auto;
      width: 66.66666667%;
    }

    .col-10 {
      flex: 0 0 auto;
      width: 83.33333333%;
    }

    .col-12 {
      flex: 0 0 auto;
      width: 100%;
    }`,
})
export class InstanceDetailComponent {
  private breakpointObserver = inject(BreakpointObserver);

  instanceId = input.required<string>();

  nextStep = signal<string>('');
  blockList = signal<string>('');
  breakPoints = toSignal(this.breakpointObserver.observe([
    Breakpoints.XLarge,
    Breakpoints.Large,
    Breakpoints.Small,
    Breakpoints.XSmall,
  ]), { initialValue: { matches: false, breakpoints: {} } as BreakpointState });

  breakpointWatcher = effect(() => {
    this.breakPoints();
    untracked(() => {
      const state = this.breakPoints();
      if (state.breakpoints[Breakpoints.XLarge]) {
        this.nextStep.set('col-2');
        this.blockList.set('col-10');
      } else if (state.breakpoints[Breakpoints.Large]) {
        this.nextStep.set('col-2');
        this.blockList.set('col-10');
      } else if (state.breakpoints[Breakpoints.Small]) {
        this.nextStep.set('col-12');
        this.blockList.set('col-12');
      } else if (state.breakpoints[Breakpoints.XSmall]) {
        this.nextStep.set('col-12');
        this.blockList.set('col-12');
      } else {
        this.nextStep.set('col-4');
        this.blockList.set('col-8');
      }
    });
  });
}
