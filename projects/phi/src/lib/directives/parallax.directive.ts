import { AfterViewInit, Directive, ElementRef, HostListener, Input } from '@angular/core';
import { fromEvent } from 'rxjs';

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

    console.log({assignedParent: this.phiParallaxParent});

    fromEvent(this.phiParallaxParent, 'scroll').subscribe(() => {
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

    if ((scrollTop + parentHeight) >= elementPosition) {
      const positionY = Math.floor((scrollTop - elementPosition) * this.phiParallax);

      this.elm.nativeElement.style.backgroundPositionY = `${positionY}px`;

    }
  }

}
