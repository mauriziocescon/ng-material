import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

import { map } from 'rxjs/operators';

import { InstanceDetailDataClient } from '../store/instance-detail-data-client';
import { InstanceDetailStore } from '../store/instance-detail-store';

import { BlockList } from './block-list/block-list';
import { NextStep } from './next-step/next-step';

@Component({
  selector: 'app-instance-detail',
  imports: [
    BlockList,
    NextStep,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    InstanceDetailDataClient,
    InstanceDetailStore,
  ],
  template: `
    <div class="instance-detail">
      <div [class]="nextStep()">
        <app-next-step [instanceId]="instanceId()"/>
      </div>
      <div [class]="blockList()">
        <app-block-list [instanceId]="instanceId()"/>
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
export class InstanceDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private breakpointObserver = inject(BreakpointObserver);
  private instanceDetailStore = inject(InstanceDetailStore);

  private readonly paramId$ = this.route.paramMap.pipe(map(params => params.get('id') as string));
  protected readonly instanceId = toSignal(this.paramId$, { initialValue: '' });

  canDeactivate = toObservable(this.instanceDetailStore.isSyncRequired).pipe(map(v => !v));

  protected readonly breakPoints = toSignal(this.breakpointObserver.observe([
    Breakpoints.XLarge,
    Breakpoints.Large,
    Breakpoints.Small,
    Breakpoints.XSmall,
  ]), { initialValue: { matches: false, breakpoints: {} } as BreakpointState });

  protected readonly blockList = computed(() => {
    const state = this.breakPoints();
    if (state.breakpoints[Breakpoints.XLarge]) {
      return 'col-10';
    } else if (state.breakpoints[Breakpoints.Large]) {
      return 'col-10';
    } else if (state.breakpoints[Breakpoints.Small]) {
      return 'col-12';
    } else if (state.breakpoints[Breakpoints.XSmall]) {
      return 'col-12';
    } else {
      return 'col-8';
    }
  });
  protected readonly nextStep = computed(() => {
    const state = this.breakPoints();
    if (state.breakpoints[Breakpoints.XLarge]) {
      return 'col-2';
    } else if (state.breakpoints[Breakpoints.Large]) {
      return 'col-2';
    } else if (state.breakpoints[Breakpoints.Small]) {
      return 'col-12';
    } else if (state.breakpoints[Breakpoints.XSmall]) {
      return 'col-12';
    } else {
      return 'col-4';
    }
  });

  ngOnInit() {
    this.instanceDetailStore.setup();
  }
}
