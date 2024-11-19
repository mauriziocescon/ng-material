import { Directive, effect, ElementRef, inject, input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appValidityState]',
})
export class ValidityStateDirective implements OnInit {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  valid = input.required<boolean>();

  private validWatcher = effect(() => {
    if (this.valid() === true) {
      this.removeInvalidSymbol();
      this.addValidSymbol();
    } else {
      this.removeValidSymbol();
      this.addInvalidSymbol();
    }
  });

  ngOnInit(): void {
    this.renderer.addClass(this.el.nativeElement, 'bi');
  }

  private addValidSymbol(): void {
    this.renderer.setStyle(this.el.nativeElement, 'color', 'green');
    this.renderer.addClass(this.el.nativeElement, 'bi-hand-thumbs-up-fill');
  }

  private removeValidSymbol(): void {
    this.renderer.removeClass(this.el.nativeElement, 'bi-hand-thumbs-up-fill');
  }

  private addInvalidSymbol(): void {
    this.renderer.setStyle(this.el.nativeElement, 'color', 'red');
    this.renderer.addClass(this.el.nativeElement, 'bi-hand-thumbs-down-fill');
  }

  private removeInvalidSymbol(): void {
    this.renderer.removeClass(this.el.nativeElement, 'bi-hand-thumbs-down-fill');
  }
}
