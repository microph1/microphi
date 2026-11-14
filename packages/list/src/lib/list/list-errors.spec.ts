import { ListError } from '../errors';
import { List } from './list';

describe('ListError', () => {

  let list: List<{ id: string }>;

  beforeEach(() => {
    list = new List('id', [{ id: 'a' }, { id: 'b' }]);
    // bypass the list's methods: the ids still contain "a"
    list.entities.delete('a');
  });

  it('LIST001: iterating an id with no entity', () => {
    expect(() => [...list]).toThrow(ListError);
    expect(() => [...list]).toThrow(/^LIST001: Cannot get entity with id a\./);
  });

  it('LIST002: ids and entities out of sync', () => {
    expect(() => list.size).toThrow(/^LIST002: Size mismatch: 2 ids !== 1 entities\..*\nSee https:\/\/github\.com\/microph1\/microphi\/blob\/master\/packages\/list\/ERRORS\.md#list002$/s);
  });
});
