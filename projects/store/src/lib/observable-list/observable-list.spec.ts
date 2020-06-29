import { ObservableList } from './observable-list';

xdescribe('ObservableList', () => {


  beforeEach(() => {

  });

  it('should create with primitive types', () => {
    const myStrings = ['a', 'b', 'c'];
    const list: ObservableList<string> = new ObservableList<string>(myStrings);
    console.log('list to string', list.toString());
    console.log('list to json', list.toJSON());
    console.log('list', list);
    // expect(list.size).toEqual(3);
  });

  it('should create a list with objects', () => {
    const myObjects = [
      {a: 1, b: 2, c: 3},
      {a: 2, b: 3, c: 4},
    ];

    const myList = new ObservableList(myObjects);

    // expect(myList.size).toEqual(2);

  });

  it('should create a list with objects specifying idFieldName', () => {
    const myObjects = [
      {a: 2, b: 3, c: 4},
      {a: 1, b: 2, c: 3},
      {a: 3, b: 2, c: 3},
    ];

    const myList = new ObservableList(myObjects, 'a');

    for (const item of myList) {
      console.log(item.getValue());
    }

    // expect(myList.get('1')).toEqual({a: 1, b: 2, c: 3});
    // expect(myList.get('3')).toEqual({a: 3, b: 2, c: 3});
    // expect(myList.get('4')).toBeUndefined();
    //
    // expect(myList.size).toEqual(3);

  });

  it('should thrown an error if any duplicate key', () => {
    const myObjects = [
      {a: 2, b: 3, c: 4},
      {a: 1, b: 2, c: 3},
      {a: 3, b: 2, c: 3},
    ];

    expect(() => {
      const myList = new ObservableList(myObjects, 'b');
    }).toThrow(new Error('Duplicate key found.'));

  });
});
