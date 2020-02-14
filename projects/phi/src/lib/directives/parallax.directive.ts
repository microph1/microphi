import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[phiParallax]'
})
export class ParallaxDirective implements AfterViewInit {

  @Input()
  public phiParallax: number;

  @Input()
  public parallaxStartOffset = 0;

  @Input()
  public phiParallaxParent = window;

  constructor(private elm: ElementRef) {}

  ngAfterViewInit(): void {

    if (!this.phiParallax) {
      this.phiParallax = 1;
    }

    this.phiParallaxParent.addEventListener('scroll', () => {
      this.updateParallax();
    });

    this.updateParallax();
  }

  private updateParallax() {

    let parentHeight;
    let scrollTop;

    if (this.phiParallaxParent === window) {
      parentHeight = this.phiParallaxParent.innerHeight;
      scrollTop = this.phiParallaxParent.pageYOffset;
    } else if (this.phiParallaxParent instanceof HTMLElement) {
      parentHeight = this.phiParallaxParent.offsetHeight;
      scrollTop = this.phiParallaxParent.scrollTop;
    }

    const elementPosition = this.elm.nativeElement.offsetTop;

    const positionY = Math.floor((scrollTop - elementPosition) * this.phiParallax);

    if ((scrollTop + parentHeight) >= elementPosition) {
      this.elm.nativeElement.style.backgroundPositionY = `${positionY}px`;
    }
  }

}
