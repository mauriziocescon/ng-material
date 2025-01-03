import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bi bi-arrow-up-circle go-up"></div>`,
  styles: `
    .go-up {
      font-size: 3rem;
      position: fixed;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      color: var(--primary-color);
      opacity: 0.7;
      bottom: 5px;
      right: 3%;
      transform: translateX(-50%);
      z-index: 200;
    }`,
  host: {
    '(window:scroll)': 'onWindowScroll($event)',
    '(click)': 'scrollToTop($event)',
  },
})
export class ScrollToTop {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  private readonly domReady = afterNextRender(() => this.renderer.setStyle(this.el.nativeElement, 'visibility', 'hidden'));

  onWindowScroll(event: any) {
    const scrollTopHeight = this.document.documentElement.scrollTop || 0;
    if (scrollTopHeight > 100) {
      this.renderer.setStyle(this.el.nativeElement, 'visibility', 'visible');
    } else {
      this.renderer.setStyle(this.el.nativeElement, 'visibility', 'hidden');
    }
  }

  scrollToTop(event: any) {
    this.document.documentElement.scrollTop = 0;
  }
}
