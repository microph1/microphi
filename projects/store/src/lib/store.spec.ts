import { getStoreMetadata, Store } from './store';

describe('@Store', () => {

  enum Actions {
    ACTION_ONE,
    ACTION_TWO,
  }

  @Store({
    initialState: [],
    name: 'MyStore',
    actions: Actions,
    useLocalStorage: true,
  })
  class MyStore {}

  let store: MyStore;

  beforeEach(() => {
    store = new MyStore();
  });

  it('should decorate a class', () => {
    expect(getStoreMetadata(store)).toEqual({
      initialState: [],
      name: 'MyStore',
      actions: Actions,
      useLocalStorage: true,
    });

  });

});
