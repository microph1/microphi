import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[phiParallax]'
})
export class ParallaxDirective implements AfterViewInit {
  private parent: HTMLElement;


  @Input()
  public phiParallax: number;

  @Input()
  public parallaxStartOffset = 0;

  constructor(private elm: ElementRef) {}

  ngAfterViewInit(): void {

    if (!this.phiParallax) {
      this.phiParallax = 1;
    }

    this.elm.nativeElement.style.transition = 'none';

    if (this.elm.nativeElement.offsetParent === document.body) {
      this.parent = document.scrollingElement as HTMLElement;
      document.addEventListener('scroll', () => this.updateParallax());
    } else {
      this.parent = this.elm.nativeElement.offsetParent;
      this.elm.nativeElement.offsetParent.addEventListener('scroll', () => this.updateParallax());
    }

    this.updateParallax();
  }

  private updateParallax() {

    const parentHeight = this.parent.offsetHeight;
    const elementPosition = this.elm.nativeElement.offsetTop;
    const scrollTop = this.parent.scrollTop;

    if ((scrollTop + parentHeight) >= elementPosition) {
      const positionY = Math.floor((scrollTop - elementPosition) * this.phiParallax);

      this.elm.nativeElement.style.backgroundPositionY = `${positionY}px`;

    }
  }

}
