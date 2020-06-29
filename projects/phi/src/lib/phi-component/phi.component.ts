import { Component, Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Abstract class to handle unsubscription of observables.
 *
 * @example
 * class TestComponent extends PhiComponent implements OnInit {
 *   private source$ = interval(1000);
 *
 *   ngOnInit(): void {
 *     this.addSubscription = this.source$.subscribe((value) => {
 *       console.log('value', value);
 *     });
 *   }
 * }
 *
 */
@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class PhiComponent implements OnDestroy {

  private subscriptions: Subscription[] = [];

  protected set addSubscription(sub: Subscription) {
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

}
