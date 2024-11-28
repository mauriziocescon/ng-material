import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

import { map } from 'rxjs/operators';

import { InstanceDetailService } from '../store/instance-detail.service';
import { InstanceDetailStore } from '../store/instance-detail.store';

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
    InstanceDetailService,
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
export class InstanceDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private breakpointObserver = inject(BreakpointObserver);
  private instanceDetailStore = inject(InstanceDetailStore);

  private readonly paramId$ = this.route.paramMap.pipe(map(params => params.get('id') as string));
  protected readonly instanceId = toSignal(this.paramId$, { initialValue: '' });

  canDeactivate = true;

  protected readonly nextStep = signal('');
  protected readonly blockList = signal('');
  protected readonly breakPoints = toSignal(this.breakpointObserver.observe([
    Breakpoints.XLarge,
    Breakpoints.Large,
    Breakpoints.Small,
    Breakpoints.XSmall,
  ]), { initialValue: { matches: false, breakpoints: {} } as BreakpointState });

  private readonly breakpointWatcher = effect(() => {
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

  private readonly syncRequiredWatcher = effect(() => {
    this.instanceDetailStore.isSyncRequired();
    untracked(() => this.canDeactivate = !this.instanceDetailStore.isSyncRequired());
  });

  ngOnInit() {
    this.instanceDetailStore.setup();
  }

  ngOnDestroy() {
    this.instanceDetailStore.reset();
  }
}
