import { ChangeDetectionStrategy, Component, computed, inject, input, TemplateRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-instance-detail-layout',
  imports: [
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout">
      <div [class]="leftClass()">
        <ng-container [ngTemplateOutlet]="left()"/>
      </div>
      <div [class]="rightClass()">
        <ng-container [ngTemplateOutlet]="right()"/>
      </div>
    </div>`,
  styles: `
    .layout {
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
export class Layout {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly left = input.required<TemplateRef<unknown>>();
  readonly right = input.required<TemplateRef<unknown>>();

  protected readonly breakPoints = toSignal(this.breakpointObserver.observe([
    Breakpoints.XLarge,
    Breakpoints.Large,
    Breakpoints.Small,
    Breakpoints.XSmall,
  ]), { initialValue: { matches: false, breakpoints: {} } as BreakpointState });

  protected readonly leftClass = computed(() => {
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
  protected readonly rightClass = computed(() => {
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
}
