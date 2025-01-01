import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
  ],
  template: `
    @if (isLoading()) {
      <div class="spinner"></div>
    }
    <ng-container [ngTemplateOutlet]="content()"/>`,
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
        opacity: 0.1;
        content: '';
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

          z-index: 1000;
          content: '';
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

  readonly isLoading = input.required({ transform: booleanAttribute });
  readonly hasNoData = input.required({ transform: booleanAttribute });
  readonly shouldRetry = input.required({ transform: booleanAttribute });

  protected readonly hostCssClasses = computed(() => this.isLoading() ? `loader` : ``);
}
