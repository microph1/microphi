



// import { Store } from '../store';
// import { BaseStore } from '../base-store';
// import { map } from 'rxjs/operators';
// import { Effect } from '../effects/effect';
// import { of, throwError } from 'rxjs';
// import { Reduce } from '../reduce';
// import { expectEffect } from './test-utilities';
// import { Disclose } from '../test/test-cloack';
//
// describe('test-utilities', () => {
//   interface ItemsState {
//     items: any[];
//   }
//
//
//   enum ItemsActions {
//     ACTION_ONE,
//     ACTION_TWO,
//     ACTION_THREE,
//     ACTION_ZERO,
//   }
//
//
//   @Store({
//     actions: ItemsActions,
//     name: 'MyStore',
//     initialState: { items: [] },
//   })
//   class MyStore extends BaseStore<ItemsState> {
//
//     public items$ = this.store$.pipe(
//       map((state) => {
//         return state.items;
//       })
//     );
//
//     @Effect(ItemsActions.ACTION_ZERO)
//     protected onActionZero(name: any) {
//       return of(name);
//     }
//
//     @Effect(ItemsActions.ACTION_THREE)
//     protected effectThatThrows() {
//       return throwError(new Error('Effect error'));
//     }
//
//     @Reduce(ItemsActions.ACTION_TWO)
//     protected thisWillThrow() {
//       console.log('calling method that will throw');
//       throw new Error('my awesome error!');
//     }
//
//     @Reduce(ItemsActions.ACTION_ONE)
//     protected setState(state: ItemsState, items: any[]): ItemsState {
//
//       return {
//         ...state,
//         items: items
//       };
//
//     }
//   }
//
//   let store: MyStore;
//   // let testBed: TestBed<{
//   //   actions: ItemsActions,
//   // }>;
//
//   beforeEach(() => {
//     const TestStore = Disclose(MyStore);
//     store = new TestStore();
//     // testBed = new TestBed();
//   });
//
//   describe('#runEffect', () => {
//
//     it('should ', () => {
//       // store.
//
//       console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
//       console.log(store['actions']);
//
//       console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
//
//       expectEffect(store, ItemsActions.ACTION_ONE, 'name-0');
//
//     });
//
//   });
//
// });
