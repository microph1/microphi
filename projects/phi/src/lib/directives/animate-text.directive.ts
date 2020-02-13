import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import { asyncScheduler, from, interval, Observable } from 'rxjs';
import { delayWhen, observeOn, switchMap } from 'rxjs/operators';


/**
 * Animates the textContent of the referenced element
 *
 */
@Directive({
  selector: '[phiAnimateText]'
})
export class AnimateTextDirective implements AfterViewInit {

  /**
   * It will contain an array with the words that will be `retyped` into the
   * containing element.
   *
   */
  private text: string[];

  private typer$: Observable<string>;

  private lastDelay = 0;

  constructor(private elm: ElementRef) {}

  public ngAfterViewInit(): void {
    // same an array of the words to `retype`
    this.text = this.elm.nativeElement.textContent.split('');

    this.elm.nativeElement.textContent = '';
    // ['crafting software with love', 'asdfasldkfj', 'asdfasdkfjasdf']
    this.typer$ = from(this.text);


    // subscribe to type trigger
    this.typer$.pipe(
      switchMap((word) => word),
      observeOn(asyncScheduler),
      delayWhen(this.randomDelay.bind(this))
    ).subscribe((letter) => {
      this.elm.nativeElement.textContent += letter;
    });

  }

  private randomDelay() {
    const delay = this.lastDelay + (Math.random() * 500);
    this.lastDelay = delay;

    return interval(delay);
  }
}
