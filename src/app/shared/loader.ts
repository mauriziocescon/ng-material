import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    TranslocoPipe,
  ],
  template: `
    @if (showContent()) {
      <ng-container [ngTemplateOutlet]="content()"/>
    }

    @if (isLoading()) {
      <div class="spinner"></div>
    } @else if (hasNoData()) {
      <div class="full-width-message">{{ "LOADER.NO_RESULT" | transloco }}</div>
    } @else if (shouldRetry()) {
      <div class="full-width-message" (click)="reload.emit()">{{ "LOADER.RETRY" | transloco }}</div>
    } @else if (isLoadCompleted()) {
      <div class="full-width-message">{{ "LOADER.LOAD_COMPLETED" | transloco }}</div>
    }`,
  styles: `
    :host.loader {
      display: block;
      position: relative;

      &::after {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: lightgrey;
        opacity: 0.15;
        content: '';
        z-index: 5000;
      }

      .spinner {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;

        &::before {
          display: block;
          position: sticky;
          top: 20px;
          margin-top: 20px;
          margin-left: calc(50% - 30px);

          width: 60px;
          height: 60px;
          border: 5px solid lightgray;
          border-bottom-color: #666;
          border-radius: 50%;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;

          content: '';
          z-index: 5000;
        }
      }

      @keyframes rotation {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    }`,
  host: {
    '[class]': 'hostCssClasses()',
  },
})
export class Loader {
  readonly content = input.required<TemplateRef<unknown>>();

  readonly showData = input(true, { transform: booleanAttribute });
  readonly isLoading = input.required({ transform: booleanAttribute });
  readonly hasNoData = input.required({ transform: booleanAttribute });
  readonly shouldRetry = input.required({ transform: booleanAttribute });
  readonly isLoadCompleted = input(true, { transform: booleanAttribute });

  readonly reload = output<void>();

  protected readonly showContent = computed(() => this.showData() && this.content());
  protected readonly hostCssClasses = computed(() => this.isLoading() ? `loader` : ``);
}
