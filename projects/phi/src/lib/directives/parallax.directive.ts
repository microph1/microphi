import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[phiParallax]'
})
export class ParallaxDirective implements AfterViewInit {

  @Input()
  get parallax(): number {
    return this._parallax || 1;
  }

  set parallax(value: number) {
    this._parallax = value;
  }

  // tslint:disable-next-line:variable-name
  private _parallax;

  @Input()
  public parallaxStartOffset = 0;

  constructor(private elm: ElementRef) {}

  ngAfterViewInit(): void {

    this.updateParallax();
    this.elm.nativeElement.offsetParent.addEventListener('scroll', () => this.updateParallax());
  }

  private updateParallax() {
    const parentHeight = this.elm.nativeElement.offsetParent.offsetHeight;
    const elementPosition = this.elm.nativeElement.offsetTop;
    const elementHeight = this.elm.nativeElement.offsetHeight;
    const scrollTop = this.elm.nativeElement.offsetParent.scrollTop;

    if ((scrollTop + parentHeight) >= elementPosition) {

      this.elm.nativeElement.style.backgroundPositionY = `${this.parallaxStartOffset - ((scrollTop - elementHeight - elementPosition) * this.parallax)}px`;

      this.elm.nativeElement.style.backgroundPositionY = `${(scrollTop - elementPosition) * this.parallax}px`;

    }
  }

}
