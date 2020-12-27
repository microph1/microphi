// import { Disclose } from './test-cloack';
// import { Class } from 'utility-types';
// import { MyBaseClass, runEffect } from '../test-utilities/test-utilities';
// import { Observable, of } from 'rxjs';
//
// xdescribe('test-clock', () => {
//
//
//
//   type Enum = string | number;
//
//   class Instrument<X extends Enum> {
//     private field: number;
//
//     private play(note: X): boolean {
//       console.log(note);
//       return true;
//     }
//   }
//
//   enum Actions {
//     A,
//     B,
//     C,
//   }
//
//   type MyType<I extends object> = {
//     [K in keyof I]?: I[K];
//   };
//
//   type MyClass<T extends object> = Class<T> & MyType<T>;
//
//   class Trumpet extends Instrument<Actions> {}
//
//
//   function DePrivatize<T extends Class<{}>, K = keyof T>(klass: T) {
//     return class extends klass {
//
//     };
//   }
//
//
//   class Basic {
//     private field = 'i am private';
//     private play(note: A): boolean {
//       console.log(this.field);
//       return true;
//     }
//   }
//
//   class A extends Basic {}
//
//   let basicInstance: MyType<A>;
//   let trumpet: MyType<Trumpet>;
//
//   // const dePrivatized = new DePrivatize(Basic);
//
//   beforeEach(() => {
//     basicInstance = new A();
//     trumpet = new Trumpet();
//
//
//   });
//
//   it('should allow call of private function and access to private fields', () => {
//     // trumpet.play(trumpet.field);
//   });
//
//
//   class Point {
//     constructor(public x: number, public y: number) {}
//   }
//
//   enum Effects {
//     say ,
//     play,
//     eat,
//     joy,
//   }
//
//   abstract class Act<T> {
//     abstract name: string;
//     paylod: T;
//   }
//
//   class SAY extends Act<{word: string}> {
//     name: 'SAY';
//   }
//   class PLAY extends Act<{toy: string}> {
//     name: 'PLAY';
//   }
//
//
//   // tslint:disable-next-line:class-name
//   interface IActions {
//     say: ({word}: {word: string}) => void;
//     play: ({toy}: {toy: string}) => string;
//     joy: (obj: {
//       id: string;
//       email: string;
//     }) => Observable<number>;
//
//   }
//
//   class Person extends MyBaseClass<{ myState: any[] }, IActions> {
//
//
//     private value = 'golden';
//
//     constructor(public name: string) {
//       super();
//     }
//
//     // @Effect(Effects.say)
//     protected say({word}): void {
//       console.log(word);
//     }
//
//     // @Effect(Effects.play)
//     protected play({toy}: { toy: string }) {
//       console.log('playing with', toy);
//       return `${this.value} ${toy}`;
//     }
//
//     // @Effect(Effects.eat)
//     protected eat(food: any) {
//       console.log('eating', food);
//     }
//
//     protected joy() {
//       return of(2);
//     }
//   }
//
//   class Customer extends Disclose(Person) {
//     accountBalance: number;
//   }
//
//   it('should allow calling private methods', () => {
//     const TaggedPoint = Disclose(Point);
//     const point = new TaggedPoint(10, 20);
//
//     // const customer: Customer = new Customer('Joe');
//     // customer.accountBalance = 0;
//     // console.log('customer', customer);
//     //
//     // customer.testEffect(Effects.eat)('banana');
//
//
//     const rawCustomer = new Person('Joel');
//
//     rawCustomer.dispatch('play', {toy: 'trumpet'});
//
//
//     const expected = runEffect(rawCustomer, 'play', {toy: 'trumpet'});
//
//     expect(expected).toEqual('golden trumpet');
//
//   });
//
// });
