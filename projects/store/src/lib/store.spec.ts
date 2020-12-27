import { getStoreMetadata, Store } from './store';

describe('@Store', () => {


  @Store({
    initialState: [],
  })
  class MyStore {}

  let store: MyStore;

  beforeEach(() => {
    store = new MyStore();
  });

  it('should decorate a class', () => {
    expect(getStoreMetadata(store)).toEqual({
      initialState: [],
    });

  });

});
