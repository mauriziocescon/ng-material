import { Directive, effect, ElementRef, inject, input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appValidityState]',
})
export class ValidityState implements OnInit {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  readonly valid = input.required<boolean>();

  private readonly validWatcher = effect(() => {
    if (this.valid() === true) {
      this.removeInvalidSymbol();
      this.addValidSymbol();
    } else {
      this.removeValidSymbol();
      this.addInvalidSymbol();
    }
  });

  ngOnInit() {
    this.renderer.addClass(this.el.nativeElement, 'bi');
  }

  private addValidSymbol() {
    this.renderer.setStyle(this.el.nativeElement, 'color', 'green');
    this.renderer.addClass(this.el.nativeElement, 'bi-hand-thumbs-up-fill');
  }

  private removeValidSymbol() {
    this.renderer.removeClass(this.el.nativeElement, 'bi-hand-thumbs-up-fill');
  }

  private addInvalidSymbol() {
    this.renderer.setStyle(this.el.nativeElement, 'color', 'red');
    this.renderer.addClass(this.el.nativeElement, 'bi-hand-thumbs-down-fill');
  }

  private removeInvalidSymbol() {
    this.renderer.removeClass(this.el.nativeElement, 'bi-hand-thumbs-down-fill');
  }
}
