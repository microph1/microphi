import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[fxSafeRemove]'
})
export class SafeRemoveDirective {

  @Output('fxSaveRemove') click: EventEmitter<boolean> = new EventEmitter<boolean>();

  private first: boolean = false;



  @HostListener('click', ['event'])
  onClick($event) {
    console.log('clicked', $event);
    if (!this.first) {
      console.log('click again to proceed');
    }
  }


}
