import { afterRenderEffect, Directive, ElementRef, inject, input, OnInit, Renderer2, untracked } from '@angular/core';

@Directive({
  selector: '[appValidityState]',
})
export class ValidityState implements OnInit {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  readonly valid = input.required<boolean>();

  private readonly validWatcher = afterRenderEffect(() => {
    this.valid();
    untracked(() => this.manageSymbols());
  });

  ngOnInit() {
    this.renderer.addClass(this.el.nativeElement, 'bi');
  }

  private manageSymbols() {
    if (this.valid() === true) {
      this.removeInvalidSymbol();
      this.addValidSymbol();
    } else {
      this.removeValidSymbol();
      this.addInvalidSymbol();
    }
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
