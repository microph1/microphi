// import { ChangeDetectorRef, Injectable, Pipe, PipeTransform } from '@angular/core';
// import { Observable } from 'rxjs';
// import { AuthStore } from '../services/auth/auth.store';
//
// @Pipe({
//   name: 'subscribe',
//   pure: true
// })
// export class SubscribePipe implements PipeTransform {
//
//   private subscription;
//
//   public value: any;
//
//   constructor(private changeDetection: ChangeDetectorRef) {
//     console.log('creating instance');
//   }
//
//   transform(observable: Observable<any>, property?: string): any {
//     console.log('subscribing');
//     if (!this.subscription) {
//       this.subscription = observable.subscribe((val) => {
//         console.log('got new data', val);
//         this.changeDetection.detectChanges();
//         this.value = val;
//       });
//     }
//
//     if (property) {
//       return this.value[property];
//     } else {
//       return this.value;
//     }
//   }
//
// }
