import { Actions } from './actions';

describe('Actions', () => {

  enum MyActions {
    ACTION_ONE,
    ACTION_TWO,
    ACTION_THREE,
  }

  let myActions: Actions<MyActions>;

  beforeEach(() => {
    myActions = new Actions(MyActions);
  });

  it('should create', () => {
    expect(myActions).toBeTruthy();
  });

  it('should get rest actions by key', () => {
    expect(myActions.getActionsByCode(MyActions.ACTION_ONE)).toEqual({
      request: 'ACTION_ONE_REQUEST',
      response: 'ACTION_ONE_RESPONSE',
      error: 'ACTION_ONE_ERROR',
    });
  });

  it('should get rest actions by code', () => {
    expect(myActions.getActionsByName(MyActions[MyActions.ACTION_ONE])).toEqual({
      request: 'ACTION_ONE_REQUEST',
      response: 'ACTION_ONE_RESPONSE',
      error: 'ACTION_ONE_ERROR',
    })
  });

  it('should get action by name', () => {
      expect(myActions.getByName(MyActions[MyActions.ACTION_ONE])).toEqual(0);
  });

  it('should get action by ', () => {
      expect(myActions.getByCode(MyActions.ACTION_ONE)).toEqual(MyActions[MyActions.ACTION_ONE]);
  });

  it('should get action name from child', () => {
    expect(myActions.getActionNameFromChild('ACTION_ONE_REQUEST')).toEqual('ACTION_ONE');
  });

  it('should get action code from child', () => {
    expect(myActions.getActionCodeFromChild('ACTION_ONE_REQUEST')).toEqual(0);
  });

});
