import { List } from './list';

describe('list', () => {

  interface Entity {
    id: string;
    user: {
      email: string;
      name: string;
    };
    anotherField?: any;
  }

  let list: List<Entity>;

  const users: Entity[] = [
    { id: 'abc', user: {email: 'email1', name: 'name1'}},
    { id: 'bcd', user: {email: 'email2', name: 'name2'}},
    { id: 'cdf', user: {email: 'email3', name: 'name3'}},
  ];

  const update = {
    id: 'abc',
    user: {email: 'email1Edit', name: 'name1Edit'}
  };

  const newEntity = {
    id: 'trs',
    user: {email: 'emailtrs', name: 'nametrs'}
  };

  const newEntity2 = {
    id: 'lmn',
    user: {email: 'emaillmn', name: 'namelmn'}
  };

  beforeEach(() => {
    list = new List<Entity>('id', users);
  });

  it('should create an empty list', () => {
    const emptyList = new List<Entity>('id');
    expect(emptyList).toBeTruthy();
  });

  it('should have all entities', () => {

    [...list].forEach((entity, index) => {
      expect(entity).toEqual(users[index]);
    });

  });

  describe('upsert', () => {

    it('should update an entity', () => {
      list.upsert(update);

      expect(list.get('abc')).toEqual(update);

    });

    it('should insert a new entity', () => {

      list.upsert(newEntity);

      expect(list.get('trs')).toEqual(newEntity);
    });

    it('should keep track of new ids', () => {

      list.upsert(newEntity);

      expect([...list].length).toEqual(4);

    });
  });

  describe('prepend', () => {
    it('should add one entity at the top of the list', () => {

      list.prepend(newEntity);

      expect([...list]).toEqual([newEntity, ...users]);
    });

    it('should add more entities at the top of the list', () => {

      list.prepend(newEntity, newEntity2);

      expect([...list]).toEqual([newEntity, newEntity2, ...users]);
    });

    it('should move an entity at the top of the list if already existing', () => {
      list.prepend(users[1]);

      expect([...list]).toEqual([users[1], users[0], users[2]]);

    });

  });

  describe('delete', () => {

    it('should remove an entity (from the middle)', () => {
      list.delete(users[1]);

      expect(list.size).toEqual(2);


      expect([...list]).not.toContain(users[1]);
    });

    it('should remove an entity (from the start)', () => {
      list.delete(users[0]);

      expect(list.size).toEqual(2);


      expect([...list]).not.toContain(users[0]);
    });

    it('should remove an entity (from the end)', () => {
      list.delete(users[2]);

      expect(list.size).toEqual(2);


      expect([...list]).not.toContain(users[2]);
    });

    it('should not fail trying to remove an not existing entity', () => {
      list.delete({
        id: 'xyz',
        user: {
          email: 'email',
          name: 'name'
        }
      });

      expect(list.size).toEqual(3);
    });

    it('should delete many', () => {

      list.delete(users[0], users[1]);
      expect(list.size).toEqual(1);
      expect([...list]).not.toContain(users[0]);
      expect([...list]).not.toContain(users[1]);
      expect([...list]).toContain(users[2]);
    });

    it('should delete many (sparse)', () => {

      list.delete(users[1], users[2]);
      expect(list.size).toEqual(1);
      expect([...list]).not.toContain(users[1]);
      expect([...list]).not.toContain(users[2]);
      expect([...list]).toContain(users[0]);
    });
  });

  describe('append', () => {

    it('should append an new entity', () => {
      list.append(newEntity);

      expect(list.size).toEqual(4);
      expect([...list]).toContain(newEntity);
    });

    it('should move an existing entity to the bottom of the list', () => {
      list.append(users[0]);

      expect(list.size).toEqual(3);
      expect([...list][2]).toEqual(users[0]);
      expect([...list][0]).toEqual(users[1]);
      expect([...list][1]).toEqual(users[2]);
    });

    it('should move an existing entity to the bottom of the list (from the middle)', () => {
      list.append(users[1]);

      expect(list.size).toEqual(3);
      expect([...list][0]).toEqual(users[0]);
      expect([...list][1]).toEqual(users[2]);
      expect([...list][2]).toEqual(users[1]);
    });
  });

  xit('test sorting an object by field', () => {
    const a = {
      c: 2,
      b: 1,
      a: 3,
    };

    console.log({a});

    a['d'] = 4;
    console.log({a});

    console.log(
      Object.keys(a)
        .sort((x, y) => x.charCodeAt(0) - y.charCodeAt(0))
        .map((id) => a[id])
    );

  });

});
